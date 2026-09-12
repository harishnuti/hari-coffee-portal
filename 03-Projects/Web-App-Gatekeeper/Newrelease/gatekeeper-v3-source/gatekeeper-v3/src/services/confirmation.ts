import type { RegistryEntry, ConfirmationLevel } from '../data/registry/types';

/** Concept aliasing (v3.0 Appendix C carried forward): these keywords share one underlying
 *  concept and are satisfied by the same evidence — arming both isn't a stricter requirement. */
const ALIASES: Record<string, string> = {
  'V60': 'pour over', 'hand brew': 'pour over', 'filter coffee': 'pour over',
  'third wave': 'specialty coffee',
};
export function resolveEvidence(entry: RegistryEntry, concept: string) {
  return entry.concepts[concept] ?? (ALIASES[concept] ? entry.concepts[ALIASES[concept]] : undefined);
}
function resolveLevel(entry: RegistryEntry, concept: string): ConfirmationLevel {
  return resolveEvidence(entry, concept)?.level ?? 'UNCONFIRMED';
}

/** Strict-mode pass condition (v3.1 §3): any hard UNCONFIRMED excludes the candidate. */
export function passesStrict(entry: RegistryEntry, armedConcepts: string[]): boolean {
  return armedConcepts.every(c => resolveLevel(entry, c) !== 'UNCONFIRMED');
}

/** Weighted/broad fallback — same shape as the original §4 formula, concept-confirmation based. */
export function weightedScore(entry: RegistryEntry, armedConcepts: string[], weights: Record<string, number>): number {
  const total = armedConcepts.reduce((s, c) => s + (weights[c] ?? 1), 0) || 1;
  const got = armedConcepts.reduce((s, c) => {
    const lvl = resolveLevel(entry, c);
    const w = weights[c] ?? 1;
    if (lvl === 'CONFIRMED') return s + w;
    if (lvl === 'TENTATIVE' || lvl === 'CONFLICTED') return s + w * 0.5;
    return s;
  }, 0);
  return Math.round((got / total) * 100);
}

/** Confidence tier for sort/display — how strong is this candidate's evidence overall. */
export function confidenceRank(entry: RegistryEntry, armedConcepts: string[]): number {
  let rank = 0;
  for (const c of armedConcepts) {
    const ce = resolveEvidence(entry, c);
    if (!ce) continue;
    const hasTier0 = ce.evidence.some(e => e.tier === 0);
    const distinctTiers = new Set(ce.evidence.map(e => e.tier)).size;
    if (hasTier0) rank += 3;
    else if (ce.level === 'CONFIRMED') rank += distinctTiers >= 2 ? 2 : 1;
    else if (ce.level === 'TENTATIVE') rank += 0.5;
  }
  return rank;
}

export function hasConflict(entry: RegistryEntry, armedConcepts: string[]): string[] {
  return armedConcepts.filter(c => resolveLevel(entry, c) === 'CONFLICTED');
}

export function failingConcepts(entry: RegistryEntry, armedConcepts: string[]): string[] {
  return armedConcepts.filter(c => resolveLevel(entry, c) === 'UNCONFIRMED');
}
