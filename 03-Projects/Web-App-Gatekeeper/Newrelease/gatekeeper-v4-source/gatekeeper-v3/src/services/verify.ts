import type { RegistryEntry } from '../data/registry/types';
import { haversineM } from './places';

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours.openNow,places.primaryType,places.types,places.reviews';

export class PlacesError extends Error {
  constructor(public kind: 'KEY_MISSING'|'KEY_INVALID'|'KEY_REFERRER'|'QUOTA'|'NET', msg: string) { super(msg); }
}

export interface VerifiedCandidate {
  entry: RegistryEntry;
  placeId: string; name: string; address: string; lat: number; lng: number;
  rating: number|null; reviews: number; openNow: boolean|null;
  distanceM: number;
  locationMismatch: boolean; // v3.1 DR-10 — Step 1 area claim contradicted by live Google data
  reviewSnippets: string[];
  foodHeavy: boolean;
}

interface RawPlace { id: string; displayName?: { text: string }; formattedAddress?: string; location?: { latitude: number; longitude: number }; rating?: number; userRatingCount?: number; currentOpeningHours?: { openNow?: boolean }; primaryType?: string; types?: string[]; reviews?: { text?: { text: string } }[] }

async function resolveOne(apiKey: string, entry: RegistryEntry, signal: AbortSignal): Promise<RawPlace | null> {
  const res = await fetch(ENDPOINT, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELD_MASK },
    body: JSON.stringify({ textQuery: `${entry.candidateName} ${entry.areaClaimed.replace(/\s*\(CLAIMED.*\)/, '')}`, maxResultCount: 1 }),
  });
  if (res.status === 403) { const t = await res.text(); throw new PlacesError(/referer|referrer/i.test(t) ? 'KEY_REFERRER' : 'KEY_INVALID', t.slice(0, 200)); }
  if (res.status === 429) throw new PlacesError('QUOTA', 'Quota exceeded');
  if (res.status === 400 || res.status === 401) throw new PlacesError('KEY_INVALID', await res.text().then(t => t.slice(0, 200)));
  if (!res.ok) throw new PlacesError('NET', `HTTP ${res.status}`);
  const j = await res.json();
  return (j.places ?? [])[0] ?? null;
}

/** Rough same-neighborhood check: if Step 1's claimed area text doesn't appear anywhere in
 *  Google's canonical formatted address, flag LOCATION_MISMATCH (v3.1 DR-10). */
function checkAreaMatch(claimedArea: string, formattedAddress: string): boolean {
  const claim = claimedArea.replace(/\s*\(CLAIMED.*\)/, '').toLowerCase();
  const tokens = claim.split(/[\s,]+/).filter(t => t.length > 3);
  const addr = formattedAddress.toLowerCase();
  return tokens.some(t => addr.includes(t));
}

export interface VerifyOpts { apiKey: string; originLat: number|null; originLng: number|null; radiusM: number }
export interface VerifyOutcome { verified: VerifiedCandidate[]; failed: RegistryEntry[]; requestCount: number }

/** Step 2 — Verify. One Places call per Registry candidate. Never a broad discovery query. */
export async function verifyRegistryEntries(entries: RegistryEntry[], o: VerifyOpts): Promise<VerifyOutcome> {
  if (!o.apiKey) throw new PlacesError('KEY_MISSING', 'No API key configured');
  const verified: VerifiedCandidate[] = []; const failed: RegistryEntry[] = [];
  let requestCount = 0; let idx = 0; let fatal: PlacesError | null = null;

  async function worker() {
    while (idx < entries.length) {
      const entry = entries[idx++]; const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 8000);
      try {
        requestCount++;
        const raw = await resolveOne(o.apiKey, entry, ctl.signal);
        if (!raw || !raw.location) { failed.push(entry); continue; }
        const lat = raw.location.latitude, lng = raw.location.longitude;
        const distanceM = (o.originLat !== null && o.originLng !== null) ? haversineM(o.originLat, o.originLng, lat, lng) : 0;
        
        const foodTypes = ['restaurant', 'bakery', 'meal_takeaway', 'meal_delivery'];
        const isFoodHeavy = raw.primaryType ? foodTypes.includes(raw.primaryType) : (raw.types?.some(t => foodTypes.includes(t)) || false);

        verified.push({
          entry, placeId: raw.id, name: raw.displayName?.text ?? entry.candidateName,
          address: raw.formattedAddress ?? '', lat, lng,
          rating: raw.rating ?? null, reviews: raw.userRatingCount ?? 0, openNow: raw.currentOpeningHours?.openNow ?? null,
          distanceM, locationMismatch: !checkAreaMatch(entry.areaClaimed, raw.formattedAddress ?? ''),
          reviewSnippets: (raw.reviews ?? []).slice(0, 3).map(r => r.text?.text ?? '').filter(Boolean),
          foodHeavy: isFoodHeavy,
        });
      } catch (e) {
        if (e instanceof PlacesError && e.kind !== 'NET') { fatal = e; idx = entries.length; }
        else failed.push(entry);
      } finally { clearTimeout(t); }
    }
  }
  await Promise.all(Array.from({ length: Math.min(2, entries.length) }, worker)); // concurrency 2 — v3.1 fix for the timeout bug
  if (fatal && verified.length === 0 && failed.length === entries.length) throw fatal;
  return { verified, failed, requestCount };
}
