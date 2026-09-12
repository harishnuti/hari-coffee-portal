import type { Registry } from './types';

export const LAVENDER_SG: Registry = {
  city: 'Singapore', area: 'Lavender', slug: 'lavender-sg',
  keywordSet: ['specialty coffee', 'pour over', 'single origin', 'V60'],
  generatedBy: 'claude-research-session', schemaVersion: 1,
  entries: [
    {
      candidateName: 'KerYi Coffee', areaClaimed: 'Lavender St #01-08',
      researchedAt: '2026-07-06', sessionQuery: 'Lavender, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [{ tier: 0, source: 'Your Archive, Entry #38', quote: 'Colombia Finca La Esmaralda, Gesha Honey — "linalool survives 1:14"' }] },
        'single origin': { level: 'CONFIRMED', evidence: [{ tier: 0, source: 'Your Archive, Entry #38', quote: 'Colombia Finca La Esmaralda, Gesha' }] },
        'pour over': { level: 'CONFIRMED', evidence: [
          { tier: 0, source: 'Your Archive, Entry #38', quote: 'Hario Switch, 1:14 ratio' },
          { tier: 'G', source: 'Google review', quote: '"the pour-over are among the best I\u2019ve had" — 98mm Ditting flats, tight 1:14 ratio, 91\u00b0C dropping on final pour' },
        ] },
      },
    },
    {
      candidateName: 'Asylum Coffeehouse', areaClaimed: 'Jalan Besar (adjacent district)',
      researchedAt: '2026-07-06', sessionQuery: 'Lavender, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [{ tier: 0, source: 'Your Archive, Entries #17,20,45', quote: 'Peru Gesha, Castillo Watermelon co-ferment, Yellow Sudan Rume' }] },
        'single origin': { level: 'CONFIRMED', evidence: [{ tier: 0, source: 'Your Archive', quote: 'Named single-origin lots across 3 visits' }] },
        'pour over': { level: 'CONFIRMED', evidence: [{ tier: 0, source: 'Your Archive, Entry #21', quote: 'V60 dual-temperature 90+70\u00b0C' }] },
      },
    },
    {
      candidateName: 'Apartment Coffee', areaClaimed: '161 Lavender St #01-12 (CLAIMED — see flag)',
      researchedAt: '2026-07-06', sessionQuery: 'Lavender, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'TENTATIVE', evidence: [{ tier: 1, source: 'sgfoodietravels', quote: 'absolute focus on specialty coffee — Filter Coffee, their forte' }] },
        'single origin': { level: 'TENTATIVE', evidence: [{ tier: 1, source: 'DanielFoodDiary', quote: 'Colombia La Falda, notes of plum, redcurrant, grapefruit' }] },
        'pour over': { level: 'TENTATIVE', evidence: [{ tier: 1, source: 'sgfoodietravels', quote: 'Filter Coffee — their forte' }] },
      },
      // NOTE: Step 2 verification found the true address is 139 Selegie Rd, not Lavender —
      // LOCATION_MISMATCH. Retained here deliberately as the DR-10 regression fixture.
    },
    {
      candidateName: 'Zerah Coffee Roasters', areaClaimed: '465 North Bridge Rd',
      researchedAt: '2026-07-06', sessionQuery: 'Lavender, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [
          { tier: 'G', source: 'Google review', quote: 'AN AMAZING SPECIALITY COFFEE ROASTERY!' },
          { tier: 2, source: 'Prior research (Gemini guide)', quote: 'Filter Commitment 5/5' },
        ] },
        'single origin': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'Kenya S28 & S34 Washed... Ethiopia Natural... Villa Betulia filter coffee' }] },
        'pour over': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'loved their coffee, both filter and white... clean and bright filter coffee' }] },
      },
      // Excluded from a 2km-radius Lavender search by distance, not by criteria — kept in registry.
    },
    {
      candidateName: 'CSHH / Papa Palheta', areaClaimed: '150 Tyrwhitt Rd',
      researchedAt: '2026-07-06', sessionQuery: 'Lavender, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [{ tier: 1, source: 'Official site', quote: 'flagship caf\u00e9 of Papa Palheta, Singapore\u2019s specialty coffee pioneer' }] },
        'single origin': { level: 'TENTATIVE', evidence: [{ tier: 2, source: 'Prior research (ChatGPT guide)', quote: 'flagship Slow Bar with rotating microlots' }] },
        'pour over': { level: 'CONFLICTED', evidence: [
          { tier: 2, source: 'Prior research (ChatGPT guide)', quote: 'Filter Brew 5 — multiple precision filter machines' },
          { tier: 1, source: 'Newer review source', quote: 'emphasis shifted to espresso flights and cold brew' },
        ] },
      },
    },
  ],
};
