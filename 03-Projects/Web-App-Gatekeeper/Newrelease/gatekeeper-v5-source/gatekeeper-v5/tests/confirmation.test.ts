import { describe, it, expect } from 'vitest';
import { passesStrict, failingConcepts } from '../src/services/confirmation';
import { REGISTRIES, getRegistry } from '../src/data/registry';

const KW = ['specialty coffee', 'pour over', 'single origin', 'V60'];

describe('Registry structure', () => {
  it('5 registries loaded', () => expect(REGISTRIES.length).toBe(5));
  it('getRegistry resolves by slug', () => expect(getRegistry('lavender-sg')?.city).toBe('Singapore'));
  it('getRegistry returns null for unknown slug', () => expect(getRegistry('nowhere')).toBeNull());
});

describe('Appendix A regression fixtures — Lavender, SG', () => {
  const reg = getRegistry('lavender-sg')!;
  it('KerYi Coffee passes strict (Tier 0 confirmed)', () => {
    const e = reg.entries.find(x => x.candidateName === 'KerYi Coffee')!;
    expect(passesStrict(e, KW)).toBe(true);
  });
  it('Asylum Coffeehouse passes strict', () => {
    const e = reg.entries.find(x => x.candidateName === 'Asylum Coffeehouse')!;
    expect(passesStrict(e, KW)).toBe(true);
  });
  it('CSHH passes strict despite CONFLICTED pour-over (conflict ≠ exclude)', () => {
    const e = reg.entries.find(x => x.candidateName.includes('CSHH'))!;
    expect(passesStrict(e, KW)).toBe(true);
    expect(e.concepts['pour over'].level).toBe('CONFLICTED');
  });
});

describe('Appendix A — Raffles Place, SG (same-brand different-outlet)', () => {
  const reg = getRegistry('raffles-place-sg')!;
  it('Alchemist Hong Leong Building passes strict', () => {
    const e = reg.entries.find(x => x.candidateName.includes('Hong Leong'))!;
    expect(passesStrict(e, KW)).toBe(true);
  });
  it('Alchemist CIMB Plaza fails strict — same brand, different outlet', () => {
    const e = reg.entries.find(x => x.candidateName.includes('CIMB'))!;
    expect(passesStrict(e, KW)).toBe(false);
    expect(failingConcepts(e, KW)).toContain('single origin');
    expect(failingConcepts(e, KW)).toContain('pour over');
  });
  it('Tiong Hoe new outlet fails strict — espresso-focused despite brand pedigree', () => {
    const e = reg.entries.find(x => x.candidateName.includes('Tiong Hoe'))!;
    expect(passesStrict(e, KW)).toBe(false);
  });
});

describe('Appendix A — Tanjong Pagar, SG', () => {
  const reg = getRegistry('tanjong-pagar-sg')!;
  it('Nylon Coffee Roasters passes strict, Tier-0 + Tier-G converge', () => {
    const e = reg.entries.find(x => x.candidateName.includes('Nylon'))!;
    expect(passesStrict(e, KW)).toBe(true);
    expect(e.concepts['pour over'].evidence.some(ev => ev.tier === 0)).toBe(true);
    expect(e.concepts['pour over'].evidence.some(ev => ev.tier === 'G')).toBe(true);
  });
  it('Equate Coffee passes strict on Tier-0 alone despite thin Tier-G', () => {
    const e = reg.entries.find(x => x.candidateName === 'Equate Coffee')!;
    expect(passesStrict(e, KW)).toBe(true);
  });
  it('Baristart fails strict — Tier-1 claim uncorroborated', () => {
    const e = reg.entries.find(x => x.candidateName.includes('Baristart'))!;
    expect(passesStrict(e, KW)).toBe(false);
  });
});

describe('Appendix A — Johor Bahru, MY (popularity ≠ pass)', () => {
  const reg = getRegistry('johor-bahru-my')!;
  it('Sweet Blossom passes strict', () => {
    const e = reg.entries.find(x => x.candidateName.includes('Sweet Blossom'))!;
    expect(passesStrict(e, KW)).toBe(true);
  });
  it('Clod Coffee passes strict', () => {
    const e = reg.entries.find(x => x.candidateName.includes('Clod'))!;
    expect(passesStrict(e, KW)).toBe(true);
  });
  it('Sunday Morning fails strict despite 4.5★/554 reviews — house blend, not single-origin', () => {
    const e = reg.entries.find(x => x.candidateName.includes('Sunday Morning'))!;
    expect(passesStrict(e, KW)).toBe(false);
    expect(failingConcepts(e, KW)).toContain('specialty coffee');
    expect(failingConcepts(e, KW)).toContain('single origin');
  });
});

describe('Appendix A — Chinatown, SG (location mismatch precedent)', () => {
  const reg = getRegistry('chinatown-sg')!;
  it('Kurasu (claimed Telok Ayer) passes concept-strict; location flag is a Step-2-only concern', () => {
    const e = reg.entries.find(x => x.candidateName === 'Kurasu')!;
    expect(passesStrict(e, KW)).toBe(true); // concepts pass; LOCATION_MISMATCH is asserted live in verify.ts
  });
  it('September Coffee fails strict — weak brunch-fusion fit', () => {
    const e = reg.entries.find(x => x.candidateName.includes('September'))!;
    expect(passesStrict(e, KW)).toBe(false);
  });
});
