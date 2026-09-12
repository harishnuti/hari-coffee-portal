// Custom-area live search — v3.2 addition.
// Unlike verify.ts (which resolves named candidates from a pre-researched Registry against
// live Google data), this runs a broad live Places text search for any area the user types.
// Results carry NO pre-vetted evidence (no CONFIRMED/TENTATIVE tiers) — just live rating,
// review count, and simple keyword-match scoring. Clearly labeled as "live" in the UI.

import { haversineM } from './places';

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
  coffeeMention: number;
  nameBonus: number;
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
export interface ArchiveRow { Cafe_Name: string; Grinder?: string; Origin?: string; Process?: string; Brew_Method?: string; Varietal?: string }
export interface LiveSearchOpts { apiKey: string; areaText: string; radiusM: number; keywords: string[]; lat: number | null; lng: number | null; filterCoffeeRequired?: boolean; archive: ArchiveRow[] }
export interface LiveSearchOutcome { results: LiveResult[]; failedKeywords: string[]; requestCount: number }

export class PlacesError extends Error {
  constructor(public kind: 'KEY_MISSING'|'KEY_INVALID'|'KEY_REFERRER'|'QUOTA'|'NET', msg: string) { super(msg); }
}

const COFFEE_WORDS = /\b(coffee|espresso|latte|flat white|barista|brew|beans?|roast|cappuccino|long black|americano|mocha|cuppa|kopi)\b/i;

export function coffeeMentionScore(reviews: string[]): number {
  if (reviews.length === 0) return 0;
  const hits = reviews.filter(r => COFFEE_WORDS.test(r)).length;
  const ratio = hits / reviews.length;
  if (ratio === 0)   return -0.25;
  if (ratio < 0.4)   return -0.10;
  if (ratio >= 0.8)  return +0.15;
  return +0.05;
}

export function circleToRect(lat: number, lng: number, radiusM: number) {
  const dLat = radiusM / 111_320;
  const dLng = radiusM / (111_320 * Math.cos(lat * Math.PI / 180));
  return {
    low:  { latitude: lat - dLat, longitude: lng - dLng },
    high: { latitude: lat + dLat, longitude: lng + dLng },
  };
}

async function callSearch(apiKey: string, textQuery: string, signal: AbortSignal, restriction?: { lat: number; lng: number; radiusM: number }, maxResultCount = 20): Promise<RawPlace[]> {
  const payload: any = { textQuery, maxResultCount };
  if (restriction) {
    payload.locationRestriction = {
      rectangle: circleToRect(restriction.lat, restriction.lng, restriction.radiusM),
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

const DNA_STOP = new Set([
  'flat', 'white', 'natural', 'light', 'medium', 'dark', 'burr', 'coffee',
  'roast', 'roaster', 'blend', 'brew', 'unknown', 'series', 'hand',
]);

export function tokenizeDna(raw: string): string[] {
  return raw.toLowerCase()
    .replace(/[()\/,+&]/g, ' ')
    .split(/\s+/)
    .map(t => t.replace(/[^a-z0-9ö]/g, ''))
    .filter(t => t.length >= 4 || /\d/.test(t))
    .filter(t => !DNA_STOP.has(t))
    .filter(t => !/^\d+mm$/.test(t) && !/^\d+g$/.test(t));
}

export function extractDna(archive: ArchiveRow[], topN = 4): string[] {
  const counts = new Map<string, number>();
  for (const m of archive) {
    for (const field of [m.Grinder, m.Origin, m.Process, m.Varietal, m.Brew_Method]) {
      if (!field || field === 'Unknown' || field === '—') continue;
      for (const tok of new Set(tokenizeDna(field)))
        counts.set(tok, (counts.get(tok) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN * 3)
    .map(([t]) => t);
}

export function scorePlace(raw: RawPlace, matched: string[], opts: {
  evidenceKeywords: string[]; archive: ArchiveRow[]; totalWeight: number;
  filterCoffeeRequired: boolean; originLat: number|null; originLng: number|null;
}): LiveResult | null {
  const normName = raw.displayName?.text?.toLowerCase() || '';
  const rawReviews = raw.reviews?.map(r => r.text?.text ?? '').filter(Boolean) ?? [];

  let filterEvidence: string | null = null;
  let evidenceScore = 0;
  const matchedKws: MatchedKeyword[] = [];

  // 1. Cross-reference user's own Master Audit list
  if (opts.archive.some(m => m.Cafe_Name && (normName.includes(m.Cafe_Name.toLowerCase()) || m.Cafe_Name.toLowerCase().includes(normName)))) {
    filterEvidence = "Personally audited by you (in Master log)";
    evidenceScore = 0.40;
    matchedKws.push({ word: "Master Audit Log", score: 0.40 });
  }

  // 2. Scan Google Reviews
  if (!filterEvidence && rawReviews.length > 0) {
    const combinedText = rawReviews.join(' ').toLowerCase();
    for (const kw of opts.evidenceKeywords) {
      const isWordBoundaryNeeded = ['filter', 'masl'].includes(kw);
      let found = false;
      if (isWordBoundaryNeeded) {
        found = new RegExp(`\\b${kw}\\b`, 'i').test(combinedText);
      } else {
        found = combinedText.includes(kw.toLowerCase());
      }

      if (found) {
        const scoreBump = matchedKws.length === 0 ? 0.25 : 0.10;
        if (evidenceScore < 0.50) {
          const actualBump = Math.min(scoreBump, 0.50 - evidenceScore);
          evidenceScore += actualBump;
          const isDna = !['pour over', 'pourover', 'v60', 'filter', 'batch brew', 'hand brew', 'chemex', 'origami', 'aeropress', 'flat burr', 'masl', 'roasted in house'].includes(kw);
          matchedKws.push({ word: isDna ? `${kw} (Palate DNA)` : kw, score: actualBump });
        } else {
          matchedKws.push({ word: kw, score: 0 });
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
  
  if (!filterEvidence && opts.filterCoffeeRequired) evidenceScore = -0.20;
  if (opts.filterCoffeeRequired && matched.length === 0 && !filterEvidence) return null;
  
  const rating = raw.rating ?? null, reviews = raw.userRatingCount ?? 0;
  let ratingBonus = 0;
  if (rating !== null && rating >= 4.5 && reviews >= 50) ratingBonus = 0.06;
  else if (rating !== null && rating >= 4.3 && reviews >= 30) ratingBonus = 0.03;
  if (rating !== null && reviews >= 30 && rating < 4.0) ratingBonus = -0.10;

  let depthBonus = 0;
  if (reviews >= 300) depthBonus = 0.04; else if (reviews >= 100) depthBonus = 0.02;
  
  const NIGHTLIFE = ['bar', 'night_club', 'pub', 'wine_bar', 'liquor_store'];
  const DESSERT   = ['dessert_shop', 'ice_cream_shop', 'bakery', 'cake_shop', 'chocolate_shop'];
  
  const foodTypes = ['restaurant', 'bakery', 'meal_takeaway', 'meal_delivery'];
  const foodHeavy = raw.primaryType ? foodTypes.includes(raw.primaryType) : (raw.types?.some(t => foodTypes.includes(t)) || false);
  const strictCoffee = raw.primaryType === 'coffee_shop' || raw.primaryType === 'coffee_roastery';
  
  const allTypes = [raw.primaryType, ...(raw.types ?? [])].filter(Boolean) as string[];
  let typeScore = 0;
  if (allTypes.some(t => NIGHTLIFE.includes(t)))      typeScore = -0.25;
  else if (foodHeavy || allTypes.some(t => DESSERT.includes(t))) typeScore = -0.15;
  else if (strictCoffee)                              typeScore = 0.10;
  
  const coffeeMention = coffeeMentionScore(rawReviews);
  
  let nameBonus = 0;
  if (/roast|brew|pour|drip|% ?arabica|coffee/i.test(normName)) nameBonus = 0.05;

  const base = Math.min(1, matched.length / opts.totalWeight) * 0.25;
  const totalBeforeCap = base + ratingBonus + depthBonus + typeScore + evidenceScore + coffeeMention + nameBonus;
  const score = Math.max(0, Math.min(1, totalBeforeCap));
  const scoreBreakdown = { base, ratingBonus, depthBonus, typeScore, evidenceScore, coffeeMention, nameBonus, totalBeforeCap, matchedKeywords: matchedKws };
  
  const lat = raw.location?.latitude ?? opts.originLat ?? 0, lng = raw.location?.longitude ?? opts.originLng ?? 0;
  const distanceM = (opts.originLat !== null && opts.originLng !== null) ? haversineM(opts.originLat, opts.originLng, lat, lng) : 0;
  
  return {
    placeId: raw.id, name: raw.displayName?.text ?? 'Unnamed', address: raw.formattedAddress ?? '',
    lat, lng, rating, reviews, openNow: raw.currentOpeningHours?.openNow ?? null,
    primaryType: raw.primaryType ?? '', score: Math.round(score * 100), matched, distanceM, foodHeavy, filterEvidence,
    rawReviews, scoreBreakdown, originLat: opts.originLat, originLng: opts.originLng
  };
}

/** Live, unverified broad search — for areas outside the curated Registry. */
export async function liveAreaSearch(o: LiveSearchOpts): Promise<LiveSearchOutcome> {
  if (!o.apiKey) throw new PlacesError('KEY_MISSING', 'No API key configured');
  const kws = [...new Set(o.keywords.map(k => k.trim()).filter(Boolean))];
  const area = o.areaText.trim();
  const queries = kws.map(k => {
    const q = /coffee|cafe|roaster/i.test(k) ? k : `${k} coffee`;
    return area ? `${q} in ${area}` : q;
  });
  
  if (area && !kws.some(k => k.toLowerCase().includes('specialty coffee'))) {
    queries.push(`specialty coffee in ${area}`);
  }
  
  const totalWeight = queries.length || 1;

  const failed: string[] = []; let requestCount = 0;
  const perKw: (RawPlace[] | null)[] = new Array(queries.length).fill(null);

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 12000);
  
  let originLat = o.lat, originLng = o.lng;
  let lastError: unknown = null;

  try {
    if (area && (originLat === null || originLng === null)) {
      const AREA_TYPES = ['locality', 'sublocality', 'sublocality_level_1',
        'neighborhood', 'administrative_area_level_1', 'administrative_area_level_2',
        'postal_town', 'route', 'shopping_mall', 'transit_station', 'subway_station'];
      
      const geoPlaces = await callSearch(o.apiKey, area, controller.signal, undefined, 5);
      requestCount++;
      const best = geoPlaces.find(p => p.types?.some(t => AREA_TYPES.includes(t))) ?? geoPlaces[0];
      if (best?.location) {
        originLat = best.location.latitude;
        originLng = best.location.longitude;
      }
    }

    const restriction = (originLat !== null && originLng !== null && o.radiusM) 
      ? { lat: originLat, lng: originLng, radiusM: o.radiusM } 
      : undefined;

    const chunk = 4;
    for (let i = 0; i < queries.length; i += chunk) {
      const batch = queries.slice(i, i + chunk).map((q, idx) => 
        callSearch(o.apiKey, q, controller.signal, restriction).then(p => { perKw[i + idx] = p; requestCount++; })
          .catch(e => { failed.push(q); lastError = e; console.error(`Failed ${q}:`, e); })
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

  if (map.size === 0 && failed.length === queries.length && lastError instanceof PlacesError) {
    throw lastError;
  }

  const dnaKeywords = extractDna(o.archive);
  const evidenceKeywords = [
    ...new Set(["pour over", "pourover", "v60", "filter", "batch brew", "hand brew", "chemex", "origami", "aeropress", "flat burr", "masl", "roasted in house", ...dnaKeywords])
  ];
  
  const out: LiveResult[] = [];
  for (const { raw, matched } of map.values()) {
    const result = scorePlace(raw, matched, {
      evidenceKeywords, archive: o.archive, totalWeight, 
      filterCoffeeRequired: o.filterCoffeeRequired || false, originLat, originLng
    });
    if (result) out.push(result);
  }

  const filtered = out.filter(r => (originLat === null || originLng === null) ? true : r.distanceM <= o.radiusM);
  filtered.sort((a, b) => {
    const tierA = a.filterEvidence ? 0 : 1;
    const tierB = b.filterEvidence ? 0 : 1;
    if (tierA !== tierB) return tierA - tierB;
    if (b.score !== a.score) return b.score - a.score;
    return a.distanceM - b.distanceM;
  });
  return { results: filtered, failedKeywords: failed, requestCount };
}
