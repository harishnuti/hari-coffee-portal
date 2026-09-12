import type { Registry } from './types';

export const RAFFLES_PLACE_SG: Registry = {
  city: 'Singapore', area: 'Raffles Place', slug: 'raffles-place-sg',
  keywordSet: ['specialty coffee', 'pour over', 'single origin', 'V60'],
  generatedBy: 'claude-research-session', schemaVersion: 1,
  entries: [
    {
      candidateName: 'Alchemist, Hong Leong Building', areaClaimed: '16 Raffles Quay',
      researchedAt: '2026-07-06', sessionQuery: 'Raffles Place, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'Third wave coffee, both espresso and pour over options' }] },
        'single origin': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'Ethiopia Harfusa... Colombia Veracruz' }] },
        'pour over': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'both espresso and pour over options' }] },
      },
    },
    {
      candidateName: 'Alchemist, CIMB Plaza', areaClaimed: '30 Raffles Pl',
      researchedAt: '2026-07-06', sessionQuery: 'Raffles Place, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'TENTATIVE', evidence: [{ tier: 'G', source: 'Google review', quote: 'brand-recognized, Dark Matter blend' }] },
        'single origin': { level: 'UNCONFIRMED', evidence: [] },
        'pour over': { level: 'UNCONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'no seats, only for take away' } ] },
      },
    },
    {
      candidateName: 'Kurasu, Waterloo St', areaClaimed: '261 Waterloo St',
      researchedAt: '2026-07-06', sessionQuery: 'Raffles Place, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'Absolutely enjoyed the filter coffee' }] },
        'single origin': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'Indonesia Frinsa Estate pour-over' }] },
        'pour over': { level: 'CONFIRMED', evidence: [
          { tier: 'G', source: 'Google review #1', quote: 'two kettles at different temperatures... theatrical, floral aromatics up front' },
          { tier: 'G', source: 'Google review #2', quote: 'Absolutely enjoyed the filter coffee' },
        ] },
      },
    },
    {
      candidateName: 'Kurasu, Grange Rd "The Stand"', areaClaimed: '1 Grange Rd',
      researchedAt: '2026-07-06', sessionQuery: 'Raffles Place, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'high quality beans from various origins' }] },
        'single origin': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'Gesha beans available... from Thailand' }] },
        'pour over': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'hand drips with the line up of high quality beans' }] },
      },
    },
    {
      candidateName: 'Percolate, Nankin Row', areaClaimed: '3 Pickering St',
      researchedAt: '2026-07-06', sessionQuery: 'Raffles Place, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'TENTATIVE', evidence: [{ tier: 1, source: 'District Sixtyfive', quote: 'wide selection of single origins for their filter coffee' }] },
        'single origin': { level: 'TENTATIVE', evidence: [{ tier: 1, source: 'District Sixtyfive', quote: 'wide selection of single origins' }] },
        'pour over': { level: 'TENTATIVE', evidence: [{ tier: 1, source: 'District Sixtyfive', quote: 'filter coffee' }] },
      },
      // Tier-1 claims uncorroborated by the live Google review sample — flagged, not rejected.
    },
    {
      candidateName: 'Tiong Hoe Specialty Coffee, Raffles Place', areaClaimed: '1 Raffles Pl B1-34',
      researchedAt: '2026-07-06', sessionQuery: 'Raffles Place, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'fruity Ethiopian beans' }] },
        'single origin': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'two types of beans... fruity Ethiopian beans' }] },
        'pour over': { level: 'UNCONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'my favourite espresso based coffee shop around here' }] },
      },
      // New outlet (19 reviews) reads espresso-focused — recommend re-check as it matures.
    },
  ],
};
