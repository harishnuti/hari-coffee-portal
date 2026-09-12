import type { Keyword, ScoredPlace } from './store';

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours.openNow,places.primaryType,places.googleMapsUri';

export interface SearchOpts { apiKey: string; lat: number|null; lng: number|null; areaLabel: string; radiusM: number; openNow: boolean; ratingFloor: number; reviewFloor: number; scoreFloor: number }
export interface SearchOutcome { results: ScoredPlace[]; failedKeywords: string[]; originLat: number; originLng: number; requestCount: number }
export class PlacesError extends Error { constructor(public kind: 'KEY_MISSING'|'KEY_INVALID'|'KEY_REFERRER'|'QUOTA'|'NET'|'EMPTY', msg: string) { super(msg); } }

interface RawPlace { id: string; displayName?: { text: string }; formattedAddress?: string; location?: { latitude: number; longitude: number }; rating?: number; userRatingCount?: number; currentOpeningHours?: { openNow?: boolean }; primaryType?: string }

export function haversineM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371008.8, r = Math.PI / 180;
  const dLat = (bLat - aLat) * r, dLng = (bLng - aLng) * r;
  const h = Math.sin(dLat/2)**2 + Math.cos(aLat*r) * Math.cos(bLat*r) * Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export const fmtDist = (m: number) => m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`;

async function callSearch(apiKey: string, body: object, signal: AbortSignal): Promise<RawPlace[]> {
  const res = await fetch(ENDPOINT, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELD_MASK },
    body: JSON.stringify(body),
  });
  if (res.status === 403) { const t = await res.text(); throw new PlacesError(/referer|referrer/i.test(t) ? 'KEY_REFERRER' : 'KEY_INVALID', t.slice(0, 200)); }
  if (res.status === 429) throw new PlacesError('QUOTA', 'Quota exceeded');
  if (res.status === 400 || res.status === 401) throw new PlacesError('KEY_INVALID', await res.text().then(t => t.slice(0, 200)));
  if (!res.ok) throw new PlacesError('NET', `HTTP ${res.status}`);
  const j = await res.json();
  return (j.places ?? []) as RawPlace[];
}

/** Architecture §4 — normative scoring */
export function scorePlace(matchedWeights: number[], totalWeight: number, rating: number|null, reviews: number, primaryType: string) {
  const base = matchedWeights.reduce((a, b) => a + b, 0) / totalWeight;
  let ratingBonus = 0;
  if (rating !== null && rating >= 4.5 && reviews >= 50) ratingBonus = 0.06;
  else if (rating !== null && rating >= 4.3 && reviews >= 30) ratingBonus = 0.03;
  let depthBonus = 0;
  if (reviews >= 300) depthBonus = 0.04; else if (reviews >= 100) depthBonus = 0.02;
  const okTypes = ['cafe', 'coffee_shop', 'bakery', 'restaurant', 'cafeteria', 'coffee_roastery'];
  const typePenalty = primaryType && !okTypes.includes(primaryType) ? -0.15 : 0;
  const score = Math.max(0, Math.min(1, base + ratingBonus + depthBonus + typePenalty));
  return { score, base, ratingBonus, depthBonus, typePenalty };
}

export async function runSearch(keywords: Keyword[], o: SearchOpts): Promise<SearchOutcome> {
  if (!o.apiKey) throw new PlacesError('KEY_MISSING', 'No API key configured');
  const armed = keywords.filter(k => k.armed);
  if (!armed.length) throw new PlacesError('EMPTY', 'No keywords armed');
  const totalWeight = armed.reduce((a, k) => a + k.weight, 0);

  const bodies = armed.map(k => {
    const q = /coffee|cafe|roaster/i.test(k.text) ? k.text : `${k.text} coffee`;
    const body: Record<string, unknown> = { textQuery: o.areaLabel ? `${q} in ${o.areaLabel}` : q, maxResultCount: 15 };
    if (!o.areaLabel && o.lat !== null && o.lng !== null)
      body.locationBias = { circle: { center: { latitude: o.lat, longitude: o.lng }, radius: o.radiusM } };
    if (o.openNow) body.openNow = true;
    return body;
  });

  // Fan-out, concurrency 4, timeout 8 s (§7.3)
  const failed: string[] = []; let requestCount = 0;
  const perKw: (RawPlace[]|null)[] = new Array(armed.length).fill(null);
  let idx = 0; let fatal: PlacesError | null = null;
  async function worker() {
    while (idx < bodies.length) {
      const i = idx++; const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 8000);
      try { requestCount++; perKw[i] = await callSearch(o.apiKey, bodies[i], ctl.signal); }
      catch (e) {
        if (e instanceof PlacesError && ['KEY_MISSING','KEY_INVALID','KEY_REFERRER','QUOTA'].includes(e.kind)) { fatal = e; idx = bodies.length; }
        else failed.push(armed[i].text);
      } finally { clearTimeout(t); }
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, bodies.length) }, worker));
  if (fatal && perKw.every(p => p === null)) throw fatal;

  // Merge on place.id (§3.1)
  const map = new Map<string, { raw: RawPlace; matched: Keyword[] }>();
  perKw.forEach((places, i) => { if (!places) return;
    for (const p of places) {
      const e = map.get(p.id) ?? { raw: p, matched: [] };
      if (!e.matched.includes(armed[i])) e.matched.push(armed[i]);
      map.set(p.id, e);
    }
  });

  // Origin: GPS, else first result location (§7.2 area override)
  let originLat = o.lat, originLng = o.lng;
  if ((originLat === null || originLng === null)) {
    const first = [...map.values()][0]?.raw.location;
    originLat = first?.latitude ?? 1.2839; originLng = first?.longitude ?? 103.8515;
  }

  const out: ScoredPlace[] = [];
  for (const { raw, matched } of map.values()) {
    const rating = raw.rating ?? null, reviews = raw.userRatingCount ?? 0;
    if (rating !== null && rating < o.ratingFloor) continue;
    if (reviews < o.reviewFloor) continue;
    const sc = scorePlace(matched.map(k => k.weight), totalWeight, rating, reviews, raw.primaryType ?? '');
    if (sc.score < o.scoreFloor) continue;
    const lat = raw.location?.latitude ?? originLat, lng = raw.location?.longitude ?? originLng;
    const bonuses: string[] = [];
    if (sc.ratingBonus > 0) bonuses.push('highly-rated');
    if (sc.depthBonus >= 0.04) bonuses.push('review-deep');
    out.push({
      placeId: raw.id, name: raw.displayName?.text ?? 'Unnamed', address: raw.formattedAddress ?? '',
      lat, lng, rating, reviews, openNow: raw.currentOpeningHours?.openNow ?? null,
      primaryType: raw.primaryType ?? '', score: Math.round(sc.score * 100),
      matched: matched.map(k => k.text), concepts: [...new Set(matched.map(k => k.concept).filter(Boolean))],
      distanceM: haversineM(originLat, originLng, lat, lng), bonuses,
      breakdown: `base ${(sc.base*100).toFixed(0)}% (${matched.map(k=>`${k.text}×${k.weight}`).join(' + ')} / ${totalWeight})` +
        (sc.ratingBonus ? ` + rating ${(sc.ratingBonus*100).toFixed(0)}%` : '') +
        (sc.depthBonus ? ` + depth ${(sc.depthBonus*100).toFixed(0)}%` : '') +
        (sc.typePenalty ? ` − type 15%` : ''),
    });
  }
  out.sort((a, b) => a.distanceM - b.distanceM);
  return { results: out, failedKeywords: failed, originLat, originLng, requestCount };
}

export const gmapsLink = (p: { name: string; placeId: string }) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}&query_place_id=${p.placeId}`;
export const amapsLink = (p: { name: string; lat: number; lng: number }) =>
  `https://maps.apple.com/?q=${encodeURIComponent(p.name)}&ll=${p.lat},${p.lng}`;
