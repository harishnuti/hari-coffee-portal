# Gatekeeper V7 Patch — Implementation Spec

Verified against the actual V6 source. Follow phases in order; each has an
acceptance check. Three traps in the original plan are flagged inline as ⚠️ TRAP.

---

## Phase 1 — Radar Revival (`src/services/livesearch.ts`)

### 1.1 Circle → bounding rectangle

Add this helper (pure function — export it, you'll unit-test it in Phase 3):

```ts
export function circleToRect(lat: number, lng: number, radiusM: number) {
  const dLat = radiusM / 111_320;                                  // meters per degree latitude
  const dLng = radiusM / (111_320 * Math.cos(lat * Math.PI / 180)); // shrinks with latitude
  return {
    low:  { latitude: lat - dLat, longitude: lng - dLng },
    high: { latitude: lat + dLat, longitude: lng + dLng },
  };
}
```

In `callSearch`, replace the circle payload:

```ts
if (restriction) {
  payload.locationRestriction = {
    rectangle: circleToRect(restriction.lat, restriction.lng, restriction.radiusM),
  };
}
```

> ⚠️ TRAP 1: A rectangle *circumscribes* the circle — its corners are ~41%
> farther than radiusM (e.g. a 3 km radius admits places up to ~4.2 km away in
> the corners). The rectangle is the coarse API-level cut; the exact cut must
> stay client-side. Which leads to:

### 1.2 Fix the inert client-side radius filter

The final filter currently keys on `o.lat` — which Radar always passes as
`null`, so the filter has NEVER run (this was true in V5 and V6). It must key
on the **resolved** center:

```ts
// BEFORE (inert):
const filtered = out.filter(r => (o.lat === null || o.lng === null) ? true : r.distanceM <= o.radiusM);
filtered.sort((a, b) => (o.lat !== null ? a.distanceM - b.distanceM : b.score - a.score));

// AFTER:
const filtered = out.filter(r => (originLat === null || originLng === null) ? true : r.distanceM <= o.radiusM);
filtered.sort((a, b) => (originLat !== null ? a.distanceM - b.distanceM : b.score - a.score));
```

This also fixes sorting: results will finally sort by distance as intended.

### 1.3 Tighten the geocode step

`searchText("Serangoon")` can resolve to any *business* named Serangoon. Ask
for 5 results and prefer an actual locality:

```ts
const AREA_TYPES = ['locality', 'sublocality', 'sublocality_level_1',
  'neighborhood', 'administrative_area_level_1', 'administrative_area_level_2',
  'postal_town', 'route', 'shopping_mall', 'transit_station', 'subway_station'];

// in the geocode block: request maxResultCount 5 (add a param to callSearch)
const geoPlaces = await callSearch(o.apiKey, area, controller.signal, undefined, 5);
const best = geoPlaces.find(p => p.types?.some(t => AREA_TYPES.includes(t))) ?? geoPlaces[0];
if (best?.location) { originLat = best.location.latitude; originLng = best.location.longitude; }
```

(`types` is already in your FIELD_MASK — no mask change needed.)

### 1.4 Never fail silently again (root cause of the V6 disaster)

V6 shipped a 100%-failure bug that was invisible because per-query errors are
swallowed into `failedKeywords`, which the Radar UI never displays. Two changes:

a) In `liveAreaSearch`, keep the last real error and rethrow it if *everything*
failed:

```ts
let lastError: unknown = null;
// in the .catch of each batch item:
.catch(e => { failed.push(q); lastError = e; })

// before returning:
if (map.size === 0 && failed.length === queries.length && lastError instanceof PlacesError) {
  throw lastError;   // surface the real cause instead of "no results found"
}
```

b) In `radar.tsx`, when `outcome.failedKeywords.length > 0` but there ARE
results, show a warnstrip: `"${failed.length} of ${total} queries failed"`.

**Acceptance check:** search "Serangoon", 3 km. Results appear, all ≤ 3 km,
sorted by distance. Then corrupt the API key and search again — you must see a
key error, not "No live results found."

---

## Phase 2 — Dynamic Palate DNA

### 2.1 Pass data in; stop importing MASTER

Remove `import { MASTER }` from `livesearch.ts` entirely. Extend the opts:

```ts
export interface LiveSearchOpts {
  apiKey: string; areaText: string; radiusM: number; keywords: string[];
  lat: number | null; lng: number | null; filterCoffeeRequired?: boolean;
  archive: ArchiveRow[];   // NEW — pass unifiedData.value from radar.tsx
}
// minimal row shape livesearch needs:
export interface ArchiveRow { Cafe_Name: string; Grinder?: string; Origin?: string;
  Process?: string; Brew_Method?: string; Varietal?: string }
```

In `radar.tsx`:

```ts
import { unifiedData } from '../state';
// ...
const outcome = await liveAreaSearch({ ..., archive: unifiedData.value });
```

> ⚠️ TRAP 2: There are TWO places in `livesearch.ts` that read MASTER — the
> DNA extraction AND the "Personally audited by you" cross-reference
> (`MASTER.some(...)`). Switch **both** to `o.archive`, or a café you audited
> yesterday still won't show the "Personally audited" badge.

### 2.2 Tokenizer

```ts
const DNA_STOP = new Set([
  // generic words that appear in reviews with unrelated meanings:
  'flat', 'white', 'natural', 'light', 'medium', 'dark', 'burr', 'coffee',
  'roast', 'roaster', 'blend', 'brew', 'unknown', 'series', 'hand',
]);

export function tokenizeDna(raw: string): string[] {
  return raw.toLowerCase()
    .replace(/[()\/,+&]/g, ' ')
    .split(/\s+/)
    .map(t => t.replace(/[^a-z0-9ö]/g, ''))
    .filter(t => t.length >= 4 || /\d/.test(t))   // keeps 'ek43', 'v60', 'sl28', drops 'de', 'of'
    .filter(t => !DNA_STOP.has(t))
    .filter(t => !/^\d+mm$/.test(t) && !/^\d+g$/.test(t));  // drop '98mm', '15g'
}
```

Why the stop list matters: `'flat'` alone matches "flat white" in reviews (a
milk drink — the opposite signal), `'natural'` matches "natural light",
`'white'`/`'light'` are everywhere. Test these exact cases in Phase 3.

### 2.3 DNA extraction over tokens, not raw strings

```ts
function extractDna(archive: ArchiveRow[], topN = 4): string[] {
  const counts = new Map<string, number>();
  for (const m of archive) {
    for (const field of [m.Grinder, m.Origin, m.Process, m.Varietal, m.Brew_Method]) {
      if (!field || field === 'Unknown' || field === '—') continue;
      for (const tok of new Set(tokenizeDna(field)))       // Set: count once per row
        counts.set(tok, (counts.get(tok) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 3)          // require real signal, not a one-off
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN * 3)
    .map(([t]) => t);
}
```

Merge into `evidenceKeywords` with `new Set([...static, ...dna])` to dedupe
(`v60` will appear in both). Label DNA-sourced matches in the score breakdown
as `"ek43 (Palate DNA)"` so the debug drawer shows which hits came from your
own archive.

**Acceptance check:** log a fake audit with Grinder "Test Zebra 9000", reload,
run a search — `zebra` (or `9000`) should appear in the evidence keyword pool
(inspect via the debug drawer or a temporary console.log). Delete the fake audit after.

---

## Phase 3 — Tests & Polish

### 3.1 Make scoring testable first

Extract the per-place scoring body (everything inside the
`for (const { raw, matched } of map.values())` loop) into an exported pure
function so tests never need `fetch`:

```ts
export function scorePlace(raw: RawPlace, matched: string[], opts: {
  evidenceKeywords: string[]; archive: ArchiveRow[]; totalWeight: number;
  filterCoffeeRequired: boolean; originLat: number|null; originLng: number|null;
}): LiveResult | null   // null = filtered out
```

Also move `CLUSTERS` + `getClusters` out of `intel.tsx` into a new
`src/services/flavor.ts` and import it back — components aren't unit-testable,
services are.

### 3.2 The suite (`tests/livesearch.test.ts`, `tests/flavor.test.ts`)

Cases that would each have caught a real shipped bug:

```
circleToRect:
  ✓ at equator, 3000m → dLat ≈ dLng ≈ 0.02695°
  ✓ at lat 60°, dLng ≈ 2 × dLat  (cos shrink)
  ✓ output has {rectangle-shaped low/high}, and JSON.stringify(payload)
    does NOT contain '"circle"'        ← the V6 killer, now a regression test

tokenizeDna:
  ✓ 'Mahlkönig EK43 (98mm Flat)' → contains 'ek43', excludes 'flat' and '98mm'
  ✓ 'Colombia, Huila' → ['colombia', 'huila']
  ✓ 'Washed' → ['washed']; 'Natural' → []  (stop-listed)

scorePlace:
  ✓ evidence cap: 6 keyword hits still cap evidenceScore at 0.40
  ✓ 'filtered water' review does NOT match word-boundary 'filter'
  ✓ archive cross-ref: café in archive → 'Personally audited' + 0.40
  ✓ foodHeavy primaryType 'restaurant' → −0.15
  ✓ filterCoffeeRequired + zero evidence + zero matches → returns null

getClusters:
  ✓ 'bergamot and yuzu' → ['citrus']
  ✓ notes 'citrus, floral' vs verdict 'lemon jasmine' → exact match (the V5 miss)

radius filter (integration-ish, no fetch):
  ✓ resolved-origin filter drops a result at distanceM > radiusM even
    when opts.lat/lng were null            ← guards the inert-filter fix (1.2)
```

`npm test` must exit 0. That is the whole point of Phase 3.

### 3.3 Cosmetic fixes — corrected file list

> ⚠️ TRAP 3: Your plan says the hardcoded counts are in `folio.tsx` — they're
> not. They're in **`settings.tsx`** (~line 143: "53 ENTRIES · 29 CAFÉS · 17
> STARRED", also "v3.0.0" and the stale filename). Replace with dynamic values:

```tsx
import { unifiedData } from '../state';
const E = unifiedData.value;
// {E.length} ENTRIES · {new Set(E.map(e => e.Cafe_Name)).size} CAFÉS
```

Full polish checklist:
- [ ] `settings.tsx` — dynamic counts, version string v7.0.0
- [ ] `main.tsx` — header still says "Connoisseur Field Kit · v3.0" → v7.0
- [ ] `package.json` — `"version": "7.0.0"`
- [ ] `audit.tsx` — `cafeOptions` builds from `MASTER`; switch to
      `unifiedData.value` so newly audited cafés appear in the autocomplete
- [ ] Delete `src/data/registry/` for real (6 files still present in V6 —
      tree-shaken from the bundle, but the "purge" claim was untrue)
- [ ] `state.ts` dedupe key is `Date|Cafe_Name` — two different coffees at the
      same café on the same day collide. Use `Date|Cafe_Name|Coffee_Name`
- [ ] Optional: Intel `matchPercent` counts partial matches as full success —
      display "X% exact · Y% partial" instead of one inflated number

---

## Build & ship

```
npm test          # must pass (new suite)
npm run build     # tsc --noEmit + vite build
```

Copy `dist/` → `gatekeeper-v7-dist`. Verify the deployed bundle:
`grep -c '"circle"' dist/assets/index-*.js` should be **0** near
locationRestriction, and searching a 1 km radius in a dense area should return
visibly fewer results than 10 km.
