import type { Registry } from './types';

export const CHINATOWN_SG: Registry = {
  city: 'Singapore', area: 'Chinatown', slug: 'chinatown-sg',
  keywordSet: ['specialty coffee', 'pour over', 'single origin', 'V60'],
  generatedBy: 'claude-research-session', schemaVersion: 1,
  entries: [
    {
      candidateName: 'Kurasu', areaClaimed: 'Telok Ayer St (CLAIMED — see flag)',
      researchedAt: '2026-07-06', sessionQuery: 'Chinatown, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [{ tier: 1, source: 'my singapore diary', quote: 'V60 pour-overs are exceptional, beans rotate with Japanese harvest seasons' }] },
        'single origin': { level: 'CONFIRMED', evidence: [{ tier: 1, source: 'my singapore diary', quote: 'beans rotate with Japanese harvest seasons' }] },
        'pour over': { level: 'CONFIRMED', evidence: [{ tier: 1, source: 'my singapore diary', quote: 'V60 pour-overs are exceptional' }] },
      },
      // NOTE: a later Research Session (Raffles Place) resolved live Kurasu outlets to
      // Waterloo St and Grange Rd only — no Telok Ayer outlet found in Google's data.
      // Flagged LOCATION_MISMATCH; nearest real outlet is Kurasu, Waterloo St (~1.1km).
    },
    {
      candidateName: 'Spring Coffee', areaClaimed: 'Hong Lim Complex, Chinatown',
      researchedAt: '2026-07-06', sessionQuery: 'Chinatown, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'TENTATIVE', evidence: [{ tier: 1, source: 'SingaporeVerified', quote: 'value specialty coffee stop' }] },
        'single origin': { level: 'UNCONFIRMED', evidence: [] },
        'pour over': { level: 'UNCONFIRMED', evidence: [] },
      },
    },
    {
      candidateName: 'September Coffee', areaClaimed: 'South Bridge Rd, Chinatown',
      researchedAt: '2026-07-06', sessionQuery: 'Chinatown, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'TENTATIVE', evidence: [{ tier: 1, source: 'District Sixtyfive', quote: 'specialty coffee choices' }] },
        'single origin': { level: 'UNCONFIRMED', evidence: [] },
        'pour over': { level: 'UNCONFIRMED', evidence: [] },
      },
    },
  ],
};
