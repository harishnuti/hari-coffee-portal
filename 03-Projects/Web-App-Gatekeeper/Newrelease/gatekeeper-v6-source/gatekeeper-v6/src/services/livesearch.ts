// Custom-area live search — v3.2 addition.
// Unlike verify.ts (which resolves named candidates from a pre-researched Registry against
// live Google data), this runs a broad live Places text search for any area the user types.
// Results carry NO pre-vetted evidence (no CONFIRMED/TENTATIVE tiers) — just live rating,
// review count, and simple keyword-match scoring. Clearly labeled as "live" in the UI.

import { haversineM } from './places';
import { MASTER } from '../data/master';

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours.openNow,places.primaryType,places.types,places.reviews,places.websiteUri';

interface RawPlace { id: string; displayName?: { text: string }; formattedAddress?: string; location?: { latitude: number; longitude: number }; rating?: number; userRatingCount?: number; currentOpeningHours?: { openNow?: boolean }; primaryType?: string; types?: string[]; reviews?: { text?: { text: string } }[]; websiteUri?: string }

export interface MatchedKeyword {
  word: string;
  score: number;
}

export interface ScoreBreakdown {
  base: number;
  ratingBonus: number;
  depthBonus: number;
  typeScore: number;
  evidenceScore: number;
  totalBeforeCap: number;
  matchedKeywords: MatchedKeyword[];
}

export interface LiveResult {
  placeId: string; name: string; address: string; lat: number; lng: number;
  rating: number | null; reviews: number; openNow: boolean | null; primaryType: string;
  score: number; matched: string[]; distanceM: number; foodHeavy: boolean;
  filterEvidence: string | null;
  rawReviews: string[];
  scoreBreakdown: ScoreBreakdown;
  originLat: number | null;
  originLng: number | null;
}
export interface LiveSearchOpts { apiKey: string; areaText: string; radiusM: number; keywords: string[]; lat: number | null; lng: number | null; filterCoffeeRequired?: boolean }
export interface LiveSearchOutcome { results: LiveResult[]; failedKeywords: string[]; requestCount: number }

export class PlacesError extends Error {
  constructor(public kind: 'KEY_MISSING'|'KEY_INVALID'|'KEY_REFERRER'|'QUOTA'|'NET', msg: string) { super(msg); }
}

async function callSearch(apiKey: string, textQuery: string, signal: AbortSignal, restriction?: { lat: number; lng: number; radiusM: number }): Promise<RawPlace[]> {
  const payload: any = { textQuery, maxResultCount: 20 };
  if (restriction) {
    payload.locationRestriction = {
      circle: { center: { latitude: restriction.lat, longitude: restriction.lng }, radius: restriction.radiusM }
    };
  }
  
  const res = await fetch(ENDPOINT, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELD_MASK },
    body: JSON.stringify(payload),
  });
  if (res.status === 403) { const t = await res.text(); throw new PlacesError(/referer|referrer/i.test(t) ? 'KEY_REFERRER' : 'KEY_INVALID', t.slice(0, 200)); }
  if (res.status === 429) throw new PlacesError('QUOTA', 'Quota exceeded');
  if (res.status === 400 || res.status === 401) throw new PlacesError('KEY_INVALID', await res.text().then(t => t.slice(0, 200)));
  if (!res.ok) throw new PlacesError('NET', `HTTP ${res.status}`);
  const j = await res.json();
  return (j.places ?? []) as RawPlace[];
}

/** Live, unverified broad search — for areas outside the curated Registry. */
export async function liveAreaSearch(o: LiveSearchOpts): Promise<LiveSearchOutcome> {
  if (!o.apiKey) throw new PlacesError('KEY_MISSING', 'No API key configured');
  const kws = [...new Set(o.keywords.map(k => k.trim()).filter(Boolean))];
  const totalWeight = kws.length || 1;
  const area = o.areaText.trim();

  const queries = kws.map(k => {
    const q = /coffee|cafe|roaster/i.test(k) ? k : `${k} coffee`;
    return area ? `${q} in ${area}` : q;
  });
  
  if (area && !kws.some(k => k.toLowerCase().includes('specialty coffee'))) {
    queries.push(`specialty coffee in ${area}`);
  }

  const failed: string[] = []; let requestCount = 0;
  const perKw: (RawPlace[] | null)[] = new Array(queries.length).fill(null);

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 12000);
  
  let originLat = o.lat, originLng = o.lng;

  try {
    // 1. Geocode the area to get a strict center for the radius
    if (area && (originLat === null || originLng === null)) {
      const geoPlaces = await callSearch(o.apiKey, area, controller.signal);
      requestCount++;
      if (geoPlaces.length > 0 && geoPlaces[0].location) {
        originLat = geoPlaces[0].location.latitude;
        originLng = geoPlaces[0].location.longitude;
      }
    }

    const restriction = (originLat !== null && originLng !== null && o.radiusM) 
      ? { lat: originLat, lng: originLng, radiusM: o.radiusM } 
      : undefined;

    const chunk = 4;
    for (let i = 0; i < queries.length; i += chunk) {
      const batch = queries.slice(i, i + chunk).map((q, idx) => 
        callSearch(o.apiKey, q, controller.signal, restriction).then(p => { perKw[i + idx] = p; requestCount++; })
          .catch(e => { failed.push(q); console.error(`Failed ${q}:`, e); })
      );
      await Promise.all(batch);
    }
  } finally { clearTimeout(to); }

  const map = new Map<string, { raw: RawPlace; matched: string[] }>();
  perKw.forEach((places, idx) => {
    if (!places) return;
    const kw = kws[idx] ?? 'specialty coffee';
    for (const p of places) {
      if (!map.has(p.id)) map.set(p.id, { raw: p, matched: [] });
      const e = map.get(p.id)!;
      if (!e.matched.includes(kw)) e.matched.push(kw);
    }
  });

  const out: LiveResult[] = [];
  
  // Palate DNA extraction: derive top terms dynamically from MASTER
  const topFreq = (arr: (string|undefined)[]) => {
    const counts = arr.filter(Boolean).reduce((acc: any, val) => { acc[val as string] = (acc[val as string] || 0) + 1; return acc; }, {});
    return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).map(x => x[0].toLowerCase());
  };
  const dnaKeywords = [
    ...topFreq(MASTER.map(m => m.Grinder)),
    ...topFreq(MASTER.map(m => m.Origin)),
    ...topFreq(MASTER.map(m => m.Process)),
    ...topFreq(MASTER.map(m => m.Brew_Method)),
    ...topFreq(MASTER.map(m => m.Varietal))
  ].filter(w => w !== 'unknown' && w !== '—' && w.length > 2);
  
  const evidenceKeywords = [
    "pour over", "pourover", "v60", "filter", "batch brew", "hand brew", "chemex", "origami", "aeropress", "flat burr", "masl", "roasted in house", ...dnaKeywords
  ];
  
  for (const { raw, matched } of map.values()) {
    const normName = raw.displayName?.text?.toLowerCase() || '';
    const rawReviews = raw.reviews?.map(r => r.text?.text ?? '').filter(Boolean) ?? [];

    let filterEvidence: string | null = null;
    let evidenceScore = 0;
    const matchedKws: MatchedKeyword[] = [];

    // 1. Cross-reference user's own Master Audit list
    if (MASTER.some(m => m.Cafe_Name && (normName.includes(m.Cafe_Name.toLowerCase()) || m.Cafe_Name.toLowerCase().includes(normName)))) {
      filterEvidence = "Personally audited by you (in Master log)";
      evidenceScore = 0.40;
      matchedKws.push({ word: "Master Audit Log", score: 0.40 });
    }

    // 2. Scan Google Reviews
    if (!filterEvidence && rawReviews.length > 0) {
      const combinedText = rawReviews.join(' ').toLowerCase();
      for (const kw of evidenceKeywords) {
        const isWordBoundaryNeeded = ['filter', 'masl'].includes(kw);
        let found = false;
        if (isWordBoundaryNeeded) {
          found = new RegExp(`\\b${kw}\\b`, 'i').test(combinedText);
        } else {
          found = combinedText.includes(kw.toLowerCase());
        }

        if (found) {
          const scoreBump = matchedKws.length === 0 ? 0.20 : 0.10;
          if (evidenceScore < 0.40) {
            const actualBump = Math.min(scoreBump, 0.40 - evidenceScore);
            evidenceScore += actualBump;
            matchedKws.push({ word: kw, score: actualBump });
          } else {
            matchedKws.push({ word: kw, score: 0 }); // Capped but recorded
          }
        }
      }
      if (matchedKws.length > 0) {
        filterEvidence = `Found keywords: ${matchedKws.map(m => m.word).join(', ')}`;
      }
    }

    // 3. Fallback: Is it explicitly a Roaster?
    if (!filterEvidence) {
      if (normName.includes('roaster') || raw.primaryType === 'coffee_roastery') {
        filterEvidence = "Coffee Roastery (High probability of specialty filter)";
        evidenceScore = 0.40;
        matchedKws.push({ word: "Roastery Category", score: 0.40 });
      }
    }
    
    // Penalize if no evidence found but required
    if (!filterEvidence && o.filterCoffeeRequired) evidenceScore = -0.20;
    
    if (o.filterCoffeeRequired && matched.length === 0 && !filterEvidence) continue;
    
    const rating = raw.rating ?? null, reviews = raw.userRatingCount ?? 0;
    let ratingBonus = 0;
    if (rating !== null && rating >= 4.5 && reviews >= 50) ratingBonus = 0.06;
    else if (rating !== null && rating >= 4.3 && reviews >= 30) ratingBonus = 0.03;
    let depthBonus = 0;
    if (reviews >= 300) depthBonus = 0.04; else if (reviews >= 100) depthBonus = 0.02;
    
    const foodTypes = ['restaurant', 'bakery', 'meal_takeaway', 'meal_delivery'];
    const foodHeavy = raw.primaryType ? foodTypes.includes(raw.primaryType) : (raw.types?.some(t => foodTypes.includes(t)) || false);
    const strictCoffee = raw.primaryType === 'coffee_shop' || raw.primaryType === 'coffee_roastery';
    
    let typeScore = 0;
    if (foodHeavy) typeScore = -0.15;
    else if (strictCoffee) typeScore = 0.10;
    
    const base = matched.length / totalWeight;
    const totalBeforeCap = base + ratingBonus + depthBonus + typeScore + evidenceScore;
    const score = Math.max(0, Math.min(1, totalBeforeCap));
    const scoreBreakdown = { base, ratingBonus, depthBonus, typeScore, evidenceScore, totalBeforeCap, matchedKeywords: matchedKws };
    
    const lat = raw.location?.latitude ?? originLat ?? 0, lng = raw.location?.longitude ?? originLng ?? 0;
    const distanceM = (originLat !== null && originLng !== null) ? haversineM(originLat, originLng, lat, lng) : 0;
    out.push({
      placeId: raw.id, name: raw.displayName?.text ?? 'Unnamed', address: raw.formattedAddress ?? '',
      lat, lng, rating, reviews, openNow: raw.currentOpeningHours?.openNow ?? null,
      primaryType: raw.primaryType ?? '', score: Math.round(score * 100), matched, distanceM, foodHeavy, filterEvidence,
      rawReviews, scoreBreakdown, originLat, originLng
    });
  }
  const filtered = out.filter(r => (o.lat === null || o.lng === null) ? true : r.distanceM <= o.radiusM);
  filtered.sort((a, b) => (o.lat !== null ? a.distanceM - b.distanceM : b.score - a.score));
  return { results: filtered, failedKeywords: failed, requestCount };
}
