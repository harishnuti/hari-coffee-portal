import { MASTER } from '../data/master';
import { audits, wishlist } from '../main';
import { getSetting } from '../services/store';
import { useState, useEffect } from 'preact/hooks';

const uniq = (a: string[]) => [...new Set(a.filter(x => x && x !== 'Unknown' && x !== '—'))];

function Bar({ k, n, max, gold = false }: { k: string; n: number; max: number; gold?: boolean }) {
  return (
    <div class={'ibar' + (gold ? ' gold' : '')}>
      <span class="k">{k}</span>
      <div class="tr"><div class="fl" style={`width:${Math.max(4, (n / max) * 100)}%`} /></div>
      <span class="n">{n}</span>
    </div>
  );
}

export function Intel() {
  const [reqCount, setReqCount] = useState(0);
  useEffect(() => { getSetting('reqCount', 0).then(v => setReqCount(v as number)); }, []);

  const E = MASTER;
  const rvs = E.map(e => e.ratioValue).filter((r): r is number => r !== null);
  const inBand = rvs.filter(r => r >= 15 && r <= 17).length;
  const buckets: Record<string, number> = { '1:14': 0, '1:14.5–.9': 0, '1:15': 0, '1:15.1–.9': 0, '1:16': 0, '1:16.1–.9': 0, '1:17': 0 };
  for (const r of rvs) {
    if (r < 14.5) buckets['1:14']++; else if (r < 15) buckets['1:14.5–.9']++;
    else if (r === 15) buckets['1:15']++; else if (r < 16) buckets['1:15.1–.9']++;
    else if (r === 16) buckets['1:16']++; else if (r < 17) buckets['1:16.1–.9']++; else buckets['1:17']++;
  }
  const rmax = Math.max(...Object.values(buckets));

  const gmap: Record<string, { n: number; s: number; cls: string }> = {};
  for (const e of E) if (e.grinder !== 'Unknown') {
    gmap[e.grinder] = gmap[e.grinder] ?? { n: 0, s: 0, cls: e.grinderClass };
    gmap[e.grinder].n++; gmap[e.grinder].s += e.star;
  }
  const league = Object.entries(gmap).sort((a, b) => b[1].n - a[1].n);

  const geo: Record<string, { n: number; s: number }> = {};
  for (const e of E) { geo[e.geom] = geo[e.geom] ?? { n: 0, s: 0 }; geo[e.geom].n++; geo[e.geom].s += e.star; }
  const gnames: Record<string, string> = { flat: 'Flat-bottom', conical: 'Conical', immersion: 'Immersion hybrid', pour: 'Pourover (unspec.)', milk: 'Espresso / milk', auto: 'Automated' };
  const gmax = Math.max(...Object.values(geo).map(g => g.n));

  const tCls: Record<string, number> = {};
  for (const e of E) if (e.tempClass !== 'unknown') tCls[e.tempClass] = (tCls[e.tempClass] ?? 0) + 1;
  const tmax = Math.max(1, ...Object.values(tCls));
  const tnames: Record<string, string> = { constant: 'Constant', stepdown: 'Step-down / dual', ramp: 'Ascending ramp', oscillation: 'Oscillation 70→90→70' };

  const omap: Record<string, number> = {};
  for (const e of E) if (e.originCountry !== 'Unknown') omap[e.originCountry] = (omap[e.originCountry] ?? 0) + 1;
  const origins = Object.entries(omap).sort((a, b) => b[1] - a[1]);
  const omax = origins[0]?.[1] ?? 1;

  const courts: [string, (e: typeof E[0]) => boolean][] = [
    ['Gesha / Geisha', e => /gesha|geisha/i.test(e.varietal)],
    ['Sudan Rume', e => /sudan rume/i.test(e.varietal)],
    ['Bourbon family', e => /bourbon/i.test(e.varietal) && !/sudan/i.test(e.varietal)],
    ['Kenyan SL / Ruiru', e => /SL28|SL34|Ruiru/i.test(e.varietal)],
    ['Ethiopian landrace', e => /heirloom|landrace|741|welicho|kurume|dega|wolisho/i.test(e.varietal)],
    ['Caturra lineage', e => /caturra/i.test(e.varietal)],
    ['Rare / exotic', e => /wush|papayo|marshell|pacamara|laurina|parainema|liberica|catimor/i.test(e.varietal)],
  ];

  const procs: [string, (e: typeof E[0]) => boolean][] = [
    ['Washed (all)', e => /washed/i.test(e.process) && !/co-ferment|anaerobic/i.test(e.process)],
    ['Natural (classic)', e => /^natural/i.test(e.process) && !/anaerobic/i.test(e.process)],
    ['Anaerobic family', e => /anaerobic/i.test(e.process)],
    ['Honey family', e => /honey/i.test(e.process)],
    ['Co-ferment', e => /co-ferment/i.test(e.process)],
    ['Extended / mosto / EF2', e => /extended|mosto|EF2/i.test(e.process)],
  ];
  const parr = procs.map(([n, f]) => [n, E.filter(f).length] as [string, number]).filter(x => x[1] > 0);
  const pmax = Math.max(...parr.map(x => x[1]));

  const prices = E.map(e => e.priceSGD).filter((p): p is number => p !== null);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const priciest = E.filter(e => e.priceSGD !== null).sort((a, b) => b.priceSGD! - a.priceSGD!)[0];
  const value = E.filter(e => e.priceSGD !== null && e.star).sort((a, b) => a.priceSGD! - b.priceSGD!)[0];

  return (
    <div class="pane">
      <div class="sec-lbl">Archive Intelligence</div>
      <div class="stat-strip" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat"><b>{E.length}</b><span>Entries</span></div>
        <div class="stat"><b>{uniq(E.map(e => e.cafe)).length}</b><span>Cafés</span></div>
        <div class="stat"><b>{E.filter(e => e.star).length}</b><span>Starred</span></div>
        <div class="stat"><b>{uniq(E.map(e => e.originCountry)).length}</b><span>Origins</span></div>
        <div class="stat"><b>{uniq(E.map(e => e.varietal)).length}</b><span>Varietals</span></div>
        <div class="stat"><b>{uniq(E.map(e => e.process)).length}</b><span>Processes</span></div>
      </div>

      <div class="sec-lbl">Ratio Spectrum</div>
      {Object.entries(buckets).map(([k, n]) => <Bar k={k} n={n} max={rmax} gold={!k.startsWith('1:14')} />)}
      <div class="intel-note"><b>{Math.round((inBand / rvs.length) * 100)}% of known-ratio cups sit inside the 1:15–1:17 Palate DNA band</b> ({inBand} of {rvs.length}). The tight 1:14 pours cluster around immersion brews and honey Geshas, where body is the point.</div>

      <div class="sec-lbl">Grinder League</div>
      <table class="league">
        <tr><th>Grinder</th><th>Class</th><th style="text-align:right">Cups</th><th style="text-align:right">★</th></tr>
        {league.map(([g, d], i) => (
          <tr class={i === 0 ? 'top' : ''}><td>{g}</td><td class="mono">{d.cls}</td><td class="num">{d.n}</td><td class="num">{d.s}</td></tr>
        ))}
      </table>

      <div class="sec-lbl">Brewer Geometry</div>
      {Object.entries(geo).sort((a, b) => b[1].n - a[1].n).map(([k, d]) => (
        <Bar k={`${gnames[k]} (${d.s}★)`} n={d.n} max={gmax} gold={k === 'flat'} />
      ))}
      <div class="intel-note"><b>The pattern holds:</b> starred cups cluster on flat-bottom geometry; both documented execution misses (Rwanda Nkara, Suke Quto) share the V60-conical fingerprint. Geometry is now evidence, not preference.</div>

      <div class="sec-lbl">Temperature Protocols</div>
      {Object.entries(tCls).map(([k, n]) => <Bar k={tnames[k] ?? k} n={n} max={tmax} gold={k === 'oscillation'} />)}
      <div class="intel-note"><b>Range observed:</b> constant (92–95°), step-down (90→70, 88→70), the Kyūkei ascending ramp (85→95), and the newest entry — Fluid Collective's 70→90→70 thermal oscillation, deployed to tame anaerobic variables.</div>

      <div class="sec-lbl">Origin Census</div>
      {origins.map(([k, n]) => <Bar k={k} n={n} max={omax} gold={['Colombia', 'Ethiopia', 'Kenya'].includes(k)} />)}

      <div class="sec-lbl">Varietal Court</div>
      <table class="league">
        <tr><th>Court</th><th style="text-align:right">Cups</th><th style="text-align:right">★</th></tr>
        {courts.map(([name, fn], i) => {
          const es = E.filter(fn);
          return es.length ? <tr class={i === 0 ? 'top' : ''}><td>{name}</td><td class="num">{es.length}</td><td class="num">{es.filter(e => e.star).length}</td></tr> : null;
        })}
      </table>

      <div class="sec-lbl">Process Register</div>
      {parr.map(([k, n]) => <Bar k={k} n={n} max={pmax} gold={k === 'Washed (all)'} />)}

      <div class="sec-lbl">Price Intelligence</div>
      <div class="stat-strip" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat"><b>S${avg.toFixed(2)}</b><span>Avg cup</span></div>
        <div class="stat"><b>S${Math.min(...prices)}</b><span>Cheapest</span></div>
        <div class="stat"><b>S${Math.max(...prices)}</b><span>Priciest</span></div>
      </div>
      <div class="intel-note"><b>Priciest pour:</b> {priciest.coffee} (S${priciest.priceSGD}). <b>Best-value star:</b> {value.coffee} at S${value.priceSGD} — the list isn't bought, it's earned.</div>

      <div class="sec-lbl">Radar Funnel</div>
      <div class="stat-strip" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat"><b>{reqCount}</b><span>API requests</span></div>
        <div class="stat"><b>{wishlist.value.length}</b><span>Pipeline</span></div>
        <div class="stat"><b>{audits.value.length}</b><span>Field audits</span></div>
      </div>
    </div>
  );
}
