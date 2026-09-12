import { signal } from '@preact/signals';
import { keywords, lastSearch, toast, persistKeywords, wishlist, persistWishlist, goAudit, tab } from '../state';
import { runSearch, PlacesError, fmtDist, gmapsLink, amapsLink } from '../services/places';
import { getSetting, put, uid, getAll, del, type ScoredPlace, type CachedSearch } from '../services/store';
import { gateCandidate } from './gate';

const searching = signal(false);
const progress = signal('');
const area = signal('');
const results = signal<ScoredPlace[]|null>(null);
const failedKw = signal<string[]>([]);
const errMsg = signal('');
const sortMode = signal<'distance'|'score'|'rating'>('distance');
const openId = signal('');
const newKw = signal(''); const newW = signal(5);

const PRESETS: [string, string[]][] = [
  ['The Standard', ['specialty coffee','pour over']],
  ['Purist', ['specialty coffee','single origin','filter coffee']],
  ['Gesha Hunt', ['specialty coffee','gesha']],
  ['Roastery', ['coffee roaster','pour over']],
];

function getOrigin(): Promise<{lat:number|null,lng:number|null}> {
  return new Promise(res => {
    if (!navigator.geolocation || area.value.trim()) return res({ lat: null, lng: null });
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => res({ lat: null, lng: null }),
      { timeout: 6000, maximumAge: 120000 });
  });
}

async function doSearch() {
  errMsg.value = ''; failedKw.value = [];
  const apiKey = await getSetting('apiKey', '');
  if (!apiKey) { errMsg.value = 'No API key configured. Add your Google Places key in Settings — the Radar cannot search without it.'; return; }
  searching.value = true; results.value = null;
  progress.value = 'Acquiring position…';
  const { lat, lng } = await getOrigin();
  if (lat === null && !area.value.trim()) progress.value = 'Position unavailable — searching without bias…';
  else progress.value = 'Interrogating the map…';
  try {
    const outcome = await runSearch(keywords.value, {
      apiKey, lat, lng, areaLabel: area.value.trim(),
      radiusM: await getSetting('radiusM', 3000),
      openNow: await getSetting('openNow', false),
      ratingFloor: await getSetting('ratingFloor', 4.3),
      reviewFloor: await getSetting('reviewFloor', 30),
      scoreFloor: (await getSetting('scoreFloorPct', 35)) / 100,
    });
    results.value = outcome.results; failedKw.value = outcome.failedKeywords;
    const rec: CachedSearch = { id: uid(), ts: Date.now(), originLat: outcome.originLat, originLng: outcome.originLng,
      radius: await getSetting('radiusM', 3000), keywords: keywords.value.filter(k=>k.armed).map(k=>k.text),
      results: outcome.results, areaLabel: area.value.trim() };
    await put('searches', rec); lastSearch.value = rec;
    const all = await getAll<CachedSearch>('searches');
    for (const s of all.sort((a,b)=>b.ts-a.ts).slice(10)) await del('searches', s.id);
    const cnt = await getSetting('reqCount', 0); await put('settings', { key: 'reqCount', value: (cnt as number) + outcome.requestCount });
  } catch (e) {
    if (e instanceof PlacesError) {
      errMsg.value = {
        KEY_MISSING: 'No API key configured — add it in Settings.',
        KEY_INVALID: 'The API key was rejected by Google. Verify it in Settings (test button) and confirm Places API (New) is enabled on the project.',
        KEY_REFERRER: 'Google refused the key for this origin. Add https://hari-gatekeeper.netlify.app/* to the key\u2019s website restrictions.',
        QUOTA: 'Places quota exceeded for this period. The Radar stands down until it resets.',
        NET: 'Network failure mid-search. The last cached expedition is shown below if available.',
        EMPTY: 'Arm at least one keyword before searching.',
      }[e.kind];
    } else errMsg.value = 'Unexpected failure: ' + String(e).slice(0, 120);
  } finally { searching.value = false; progress.value = ''; }
}

function sorted(rs: ScoredPlace[]) {
  const r = [...rs];
  if (sortMode.value === 'score') r.sort((a,b)=>b.score-a.score);
  else if (sortMode.value === 'rating') r.sort((a,b)=>(b.rating??0)-(a.rating??0));
  else r.sort((a,b)=>a.distanceM-b.distanceM);
  return r;
}

async function addToWishlist(p: ScoredPlace) {
  const w = { id: uid(), name: p.name, area: p.address.split(',').slice(-2).join(',').trim(), lat: p.lat, lng: p.lng,
    placeId: p.placeId, priority: 'MEDIUM' as const, note: `Radar find — matched ${p.score}% (${p.matched.join(', ')})`,
    added: new Date().toISOString().slice(0,10) };
  await persistWishlist(w); wishlist.value = [w, ...wishlist.value];
  toast('Added to Pipeline');
}

export function Radar() {
  const armed = keywords.value.filter(k => k.armed);
  const shown = results.value ?? lastSearch.value?.results ?? null;
  const isCached = results.value === null && lastSearch.value !== null;
  return (
    <div class="pane">
      <div class="sec-lbl">Keyword Arsenal</div>
      <p class="hint">Tap to arm. Armed keywords each fire a live Places query; results merge, score against your weights, and rank in-app. ✕ removes.</p>
      <div class="chips">
        {keywords.value.map(k => (
          <button class={'chip' + (k.armed ? ' on' : '')} onClick={async (e) => {
            if ((e.target as HTMLElement).classList.contains('x')) { keywords.value = keywords.value.filter(x => x.id !== k.id); await del('keywords', k.id); return; }
            k.armed = !k.armed; keywords.value = [...keywords.value]; await persistKeywords();
          }}>{k.text}<span class="w">×{k.weight}</span><span class="x">✕</span></button>
        ))}
      </div>
      <div class="addrow">
        <input type="text" placeholder="add keyword…" value={newKw.value} onInput={e => newKw.value = (e.target as HTMLInputElement).value} />
        <input type="number" min={1} max={10} value={newW.value} onInput={e => newW.value = +(e.target as HTMLInputElement).value || 5} />
        <button class="btn small" onClick={async () => {
          const t = newKw.value.trim(); if (!t) return;
          const k = { id: uid(), text: t, weight: Math.min(10, Math.max(1, newW.value)), armed: true, concept: '◎ Specialty' };
          keywords.value = [...keywords.value, k]; await put('keywords', k); newKw.value = '';
        }}>Add</button>
      </div>
      <div class="seg">
        {PRESETS.map(([name, list]) => (
          <button onClick={async () => {
            keywords.value = keywords.value.map(k => ({ ...k, armed: list.includes(k.text) }));
            await persistKeywords();
          }}>{name}</button>
        ))}
      </div>
      <div class="sec-lbl">Search Area</div>
      <input type="text" placeholder="near me (GPS, default) — or type: Jurong, Tokyo, Melbourne…" value={area.value}
        onInput={e => area.value = (e.target as HTMLInputElement).value} />
      <div style="height:.7rem" />
      <button class="btn" disabled={searching.value || !armed.length} onClick={doSearch}>
        {searching.value ? 'Searching…' : `◈ Search (${armed.length} keyword${armed.length===1?'':'s'} armed)`}
      </button>

      {errMsg.value && <><div style="height:.8rem" /><div class="warnstrip">{errMsg.value}</div></>}
      {searching.value && <><div class="progress">{progress.value}</div><div class="skel" /><div class="skel" /><div class="skel" /></>}

      {shown && !searching.value && <>
        <div class="sec-lbl">{isCached ? `Last Expedition — ${new Date(lastSearch.value!.ts).toLocaleString()} (cached)` : `The Shortlist — ${shown.length} candidate${shown.length===1?'':'s'}`}</div>
        {failedKw.value.length > 0 && <div class="warnstrip">Partial results — these keywords failed: {failedKw.value.join(', ')}</div>}
        {shown.length > 0 && <div class="seg">
          {(['distance','score','rating'] as const).map(m => (
            <button class={sortMode.value === m ? 'on' : ''} onClick={() => sortMode.value = m}>By {m}</button>
          ))}
        </div>}
        {shown.length === 0 && <div class="empty">Nothing cleared the floor — widen the radius or lower the score floor in Settings</div>}
        {sorted(shown).map(p => (
          <div class={'res' + (openId.value === p.placeId ? ' open' : '')}>
            <div onClick={() => openId.value = openId.value === p.placeId ? '' : p.placeId}>
              <div class="res-top">
                <div>
                  <div class="res-name">{p.name}</div>
                  <div class="res-meta">
                    <span>📍 {fmtDist(p.distanceM)}</span>
                    {p.rating !== null && <span>★ {p.rating.toFixed(1)} ({p.reviews})</span>}
                    {p.openNow === true && <span style="color:var(--pass)">OPEN</span>}
                    {p.openNow === false && <span style="color:var(--fail)">CLOSED</span>}
                  </div>
                </div>
                <div class="res-score"><b>{p.score}%</b><span>MATCH</span></div>
              </div>
              <div class="badges">
                {p.concepts.map(c => <span class="badge">{c}</span>)}
                {p.bonuses.includes('highly-rated') && <span class="badge gold">⭐ Highly Rated</span>}
                {p.bonuses.includes('review-deep') && <span class="badge gold">🏆 Review-Deep</span>}
              </div>
            </div>
            <div class="res-detail">
              <div class="res-addr">{p.address}</div>
              <div class="res-brk">SCORE AUDIT: {p.breakdown}</div>
              <div class="acts">
                <a class="btn small" href={gmapsLink(p)} target="_blank" rel="noopener">◈ Google Maps</a>
                <a class="btn small ghost" href={amapsLink(p)} target="_blank" rel="noopener">Apple Maps</a>
                <button class="btn small ghost" onClick={() => addToWishlist(p)}>+ Pipeline</button>
                <button class="btn small ghost" onClick={() => { gateCandidate(p.name, p.address); tab.value = 'gate'; }}>Run the Gate</button>
                <button class="btn small ghost" onClick={() => goAudit(p.name)}>Begin Audit</button>
              </div>
            </div>
          </div>
        ))}
        {shown.length > 0 && <p class="mono-note" style="text-align:center;margin-top:.6rem">Powered by Google</p>}
      </>}
    </div>
  );
}
