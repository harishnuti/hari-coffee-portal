import { signal } from '@preact/signals';
import { CODEX } from '../data/defaults';
import { MASTER } from '../data/master';

const kind = signal<'grinder'|'brewer'|'method'>('grinder');

export function Codex() {
  return (
    <div class="pane">
      <div class="sec-lbl">The Codex — Hardware & Doctrine</div>
      <p class="hint">Reference intelligence on the machines and methods behind the archive. Sightings are computed live from your entries.</p>
      <div class="seg">
        {(['grinder','brewer','method'] as const).map(k => (
          <button class={kind.value === k ? 'on' : ''} onClick={() => kind.value = k}>{k}s</button>
        ))}
      </div>
      {CODEX.filter(c => c.kind === kind.value).map(c => {
        const sightings = c.match ? MASTER.filter(e => c.match!.test(e.grinder) || c.match!.test(e.brew)) : [];
        const stars = sightings.filter(e => e.star).length;
        return (
          <div class={'cx' + (c.kind === 'method' ? ' method' : '')}>
            <h3>{c.name}</h3>
            <div class="spec">{c.spec}</div>
            <div class="note">{c.note}</div>
            {sightings.length > 0 && <div class="sight">ARCHIVE SIGHTINGS: {sightings.length} cup{sightings.length === 1 ? '' : 's'}{stars ? ` · ${stars}★` : ''} — {sightings.slice(0, 4).map(e => `Nº${String(e.n).padStart(2, '0')}`).join(' · ')}{sightings.length > 4 ? ' …' : ''}</div>}
          </div>
        );
      })}
    </div>
  );
}
