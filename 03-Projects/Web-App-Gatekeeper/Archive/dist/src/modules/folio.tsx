import { signal } from '@preact/signals';
import { MASTER, type MasterEntry } from '../data/master';
import { wishlist, audits, toast, goAudit } from '../main';
import { del } from '../services/store';
import { gmapsLink } from '../services/places';

const view = signal<'journey'|'dossiers'|'pipeline'|'ledger'>('journey');
const jFilter = signal<'all'|'star'|'washed'|'natural'|'anaerobic'|'gesha'>('all');
const dSort = signal<'visits'|'recent'|'stars'>('visits');
const q = signal('');
const openN = signal(0);

const uniq = (a: string[]) => [...new Set(a.filter(x => x && x !== 'Unknown' && x !== '—'))];

interface FieldEntry { isField: true; cafe: string; city: string; coffee: string; varietal: string; process: string; brew: string; grinder: string; ratioLabel: string; temp: string; priceSGD: number|null; verdict: string; dateISO: string; id: string }
function fieldEntries(): FieldEntry[] {
  return audits.value.map(a => ({ isField: true as const, id: a.id, cafe: a.Cafe_Name || '', city: a.City || '', coffee: a.Coffee_Name || '',
    varietal: a.Varietal || 'Unknown', process: a.Process || 'Unknown', brew: a.Brew_Method || 'Unknown', grinder: a.Grinder || 'Unknown',
    ratioLabel: a.Ratio || '—', temp: a.Water_Temp_C || '—', priceSGD: parseFloat(a.Price_SGD) || null, verdict: a.Your_Verdict || '', dateISO: a.Date || '' }));
}

function dossiers() {
  const map = new Map<string, { cafe: string; city: string; es: (MasterEntry|FieldEntry)[] }>();
  for (const e of MASTER) { const d = map.get(e.cafe) ?? { cafe: e.cafe, city: e.city, es: [] }; d.es.push(e); map.set(e.cafe, d); }
  for (const f of fieldEntries()) { const d = map.get(f.cafe) ?? { cafe: f.cafe, city: f.city, es: [] }; d.es.push(f); map.set(f.cafe, d); }
  const out = [...map.values()].map(d => {
    const master = d.es.filter((e): e is MasterEntry => !('isField' in e));
    const prices = d.es.map(e => e.priceSGD).filter((p): p is number => p != null);
    const stars = master.filter(e => e.star).length;
    const best = master.filter(e => e.star).sort((a, b) => b.n - a.n)[0] ?? null;
    return { ...d, entries: d.es.length, stars,
      visits: uniq(d.es.map(e => e.dateISO)).length,
      grinders: uniq(d.es.map(e => e.grinder)), brewers: uniq(d.es.map(e => e.brew.slice(0, 34))),
      ratios: uniq(d.es.map(e => e.ratioLabel)), temps: uniq(d.es.map(e => e.temp)),
      origins: uniq(master.map(e => e.originCountry)), varietals: uniq(d.es.map(e => e.varietal)),
      procs: uniq(d.es.map(e => e.process)),
      avg: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
      last: d.es.map(e => e.dateISO).sort().at(-1) ?? '', best };
  });
  if (dSort.value === 'stars') out.sort((a, b) => b.stars - a.stars || b.entries - a.entries);
  else if (dSort.value === 'recent') out.sort((a, b) => b.last.localeCompare(a.last));
  else out.sort((a, b) => b.entries - a.entries || b.stars - a.stars);
  return out;
}

function journeyEntries() {
  let es = [...MASTER].reverse();
  const f = jFilter.value;
  if (f === 'star') es = es.filter(e => e.star);
  else if (f === 'washed') es = es.filter(e => /washed/i.test(e.process) && !/anaerobic|co-ferment/i.test(e.process));
  else if (f === 'natural') es = es.filter(e => /natural/i.test(e.process) && !/anaerobic/i.test(e.process));
  else if (f === 'anaerobic') es = es.filter(e => /anaerobic|ferment/i.test(e.process));
  else if (f === 'gesha') es = es.filter(e => /gesha|geisha/i.test(e.varietal));
  const s = q.value.toLowerCase().trim();
  if (s) es = es.filter(e => (e.coffee + e.cafe + e.varietal + e.process + e.notes + e.verdict + e.originCountry).toLowerCase().includes(s));
  return es;
}

export function Folio() {
  return (
    <div class="pane">
      <div class="seg">
        {(['journey','dossiers','pipeline','ledger'] as const).map(v => (
          <button class={view.value === v ? 'on' : ''} onClick={() => view.value = v}>{v}</button>
        ))}
      </div>

      {view.value === 'journey' && <>
        <div class="stat-strip">
          <div class="stat"><b>{MASTER.length + audits.value.length}</b><span>Entries</span></div>
          <div class="stat"><b>{dossiers().length}</b><span>Cafés</span></div>
          <div class="stat"><b>{MASTER.filter(e => e.star).length}</b><span>Starred</span></div>
          <div class="stat"><b>{uniq(MASTER.map(e => e.originCountry)).length}</b><span>Origins</span></div>
        </div>
        <div class="seg">
          {(['all','star','washed','natural','anaerobic','gesha'] as const).map(f => (
            <button class={jFilter.value === f ? 'on' : ''} onClick={() => jFilter.value = f}>{f === 'star' ? '★' : f}</button>
          ))}
        </div>
        <input type="text" placeholder="⌕  search the journey…" value={q.value} onInput={e => q.value = (e.target as HTMLInputElement).value} />
        <div style="height:.8rem" />
        {journeyEntries().map(e => (
          <div class={'jcard' + (e.star ? ' star' : '')} onClick={() => { view.value = 'ledger'; q.value = e.coffee.slice(0, 20); openN.value = e.n; }}>
            {e.star ? <span class="st">★</span> : null}
            <div class="jnum">Nº {String(e.n).padStart(2, '0')} · {e.dateISO}</div>
            <div class="jname">{e.coffee}</div>
            <div class="jmeta">{e.cafe} · {e.city} · <span class="pbadge">{e.process}</span></div>
            <div class="jnotes">{e.notes}</div>
            <div class="jverdict">{e.verdict.slice(0, 150)}{e.verdict.length > 150 ? '…' : ''}</div>
          </div>
        ))}
      </>}

      {view.value === 'dossiers' && <>
        <p class="hint">Every visited house as a technical dossier — grinders, brewers, ratios, protocols, prices — recomputed live including field audits.</p>
        <div class="seg">
          {(['visits','recent','stars'] as const).map(m => (
            <button class={dSort.value === m ? 'on' : ''} onClick={() => dSort.value = m}>By {m}</button>
          ))}
        </div>
        {dossiers().map(c => (
          <div class="card dossier">
            <h3>{c.cafe}<span class="prio gold">{c.stars >= 2 ? 'PROVEN HOUSE' : c.stars === 1 ? 'STARRED' : 'AUDITED'}</span></h3>
            <div class="dmeta">{c.city} · {c.entries} entr{c.entries === 1 ? 'y' : 'ies'} · {c.stars}★ · last {c.last}</div>
            <div class="dgrid">
              <div class="dg"><b>Grinders observed</b><span>{c.grinders.join(', ') || 'Not yet identified'}</span></div>
              <div class="dg"><b>Brewers</b><span>{c.brewers.slice(0, 3).join(', ') || '—'}</span></div>
              <div class="dg"><b>Ratios seen</b><span>{c.ratios.join(' · ') || '—'}</span></div>
              <div class="dg"><b>Temp protocols</b><span>{c.temps.slice(0, 3).join(' · ') || '—'}</span></div>
              <div class="dg"><b>Origins poured</b><span>{c.origins.join(', ') || '—'}</span></div>
              <div class="dg"><b>Varietals</b><span>{c.varietals.slice(0, 4).join(', ') || '—'}</span></div>
              <div class="dg"><b>Processes</b><span>{c.procs.slice(0, 3).join(', ') || '—'}</span></div>
              <div class="dg"><b>Avg price</b><span>{c.avg ? 'S$' + c.avg.toFixed(2) : '—'}</span></div>
            </div>
            {c.best && <div class="dbest">Standout: <em>{c.best.coffee}</em> — {c.best.notes}</div>}
            <div class="acts">
              <a class="btn small" href={gmapsLink({ name: c.cafe + ' ' + c.city, placeId: '' })} target="_blank" rel="noopener">◈ Navigate</a>
              <button class="btn small ghost" onClick={() => goAudit(c.cafe)}>Repeat Audit</button>
              <button class="btn small ghost" onClick={() => { view.value = 'ledger'; q.value = c.cafe; }}>Entries</button>
            </div>
          </div>
        ))}
      </>}

      {view.value === 'pipeline' && <>
        <p class="hint">Vetted targets awaiting first audit. Admissions from the Gate and Radar finds land here.</p>
        {wishlist.value.length === 0 && <div class="empty">The pipeline is empty — run a candidate through the Gate</div>}
        {wishlist.value.map(w => (
          <div class="card hit">
            <h3>{w.name}<span class={'prio' + (w.priority === 'HIGH' ? ' gold' : '')}>{w.priority}</span></h3>
            <div class="meta">{w.area || '—'}{w.gateScore != null ? ` · gate ${w.gateScore}%` : ''} · added {w.added}</div>
            <div class="why">{w.note}</div>
            <div class="acts">
              <a class="btn small" href={w.placeId
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(w.name)}&query_place_id=${w.placeId}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(w.name + ' ' + w.area)}`} target="_blank" rel="noopener">◈ Navigate</a>
              <button class="btn small ghost" onClick={() => goAudit(w.name)}>Begin Audit</button>
              <button class="btn small ghost" onClick={async () => { wishlist.value = wishlist.value.filter(x => x.id !== w.id); await del('wishlist', w.id); toast('Removed'); }}>Remove</button>
            </div>
          </div>
        ))}
      </>}

      {view.value === 'ledger' && <>
        <input type="text" placeholder="⌕  search the ledger…" value={q.value} onInput={e => q.value = (e.target as HTMLInputElement).value} />
        <div style="height:.8rem" />
        {fieldEntries().filter(f => !q.value || (f.coffee + f.cafe + f.varietal + f.process + f.verdict).toLowerCase().includes(q.value.toLowerCase())).map(f => (
          <div class={'vrow' + (openN.value === -1 ? '' : '')} onClick={(e) => { (e.currentTarget as HTMLElement).classList.toggle('open'); }}>
            <div class="t"><span class="nm"><span class="st">◈</span> {f.coffee}</span><span class="dt">{f.dateISO} · FIELD</span></div>
            <div class="sub">{f.cafe} · {f.varietal} · {f.process}</div>
            <div class="full">
              <div class="fld"><b>Verdict</b>{f.verdict}</div>
              <div class="fld"><b>Brew</b>{f.brew} · {f.ratioLabel} · {f.grinder}</div>
            </div>
          </div>
        ))}
        {MASTER.filter(e => !q.value || (e.coffee + e.cafe + e.varietal + e.process + e.notes + e.verdict + e.originCountry + e.grinder).toLowerCase().includes(q.value.toLowerCase())).map(e => (
          <div class={'vrow' + (openN.value === e.n ? ' open' : '')} onClick={(ev) => { (ev.currentTarget as HTMLElement).classList.toggle('open'); openN.value = 0; }}>
            <div class="t"><span class="nm">{e.star ? <span class="st">★ </span> : null}{e.coffee}</span><span class="dt">{e.dateISO.slice(5)} · Nº{String(e.n).padStart(2, '0')}</span></div>
            <div class="sub">{e.cafe} · {e.originCountry} · {e.process}</div>
            <div class="full">
              <div class="fld"><b>Origin</b>{e.originRegion} · {e.farm !== 'Unknown' ? e.farm : ''}</div>
              <div class="fld"><b>Varietal</b>{e.varietal}</div>
              <div class="fld"><b>Hardware</b>{e.brew} · {e.grinderFull} · {e.ratioLabel}{e.temp !== '—' ? ' · ' + e.temp + '°' : ''}</div>
              <div class="fld"><b>Official notes</b>{e.notes}</div>
              <div class="fld"><b>The read</b>{e.verdict}</div>
              {e.priceSGD != null && <div class="fld"><b>Price</b>S${e.priceSGD}</div>}
              <div class="fld"><b>Context</b>{e.context}</div>
            </div>
          </div>
        ))}
      </>}
    </div>
  );
}
