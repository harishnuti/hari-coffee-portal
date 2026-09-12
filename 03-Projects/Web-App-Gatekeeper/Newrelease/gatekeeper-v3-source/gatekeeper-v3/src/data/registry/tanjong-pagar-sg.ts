import type { Registry } from './types';

export const TANJONG_PAGAR_SG: Registry = {
  city: 'Singapore', area: 'Tanjong Pagar', slug: 'tanjong-pagar-sg',
  keywordSet: ['specialty coffee', 'pour over', 'single origin', 'V60'],
  generatedBy: 'claude-research-session', schemaVersion: 1,
  entries: [
    {
      candidateName: 'Corner Corner (Coffee Concept)', areaClaimed: '16 Duxton Rd',
      researchedAt: '2026-07-06', sessionQuery: 'Tanjong Pagar, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [
          { tier: 0, source: 'Your Archive, Entry #39', quote: 'Malaysia My Liberica — first non-Arabica, root beer and longan' },
          { tier: 1, source: 'DanielFoodDiary', quote: 'Japanese Desserts, Speciality Coffee, and Vinyl Vibes' },
        ] },
        'single origin': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'Malaysia "My Liberica"... grown down in Johor at near sea level by Jason Liew' }] },
        'pour over': { level: 'CONFIRMED', evidence: [{ tier: 1, source: 'DanielFoodDiary', quote: 'Instead of espresso-based drinks, guests can choose from pour-over coffee' }] },
      },
    },
    {
      candidateName: 'Nylon Coffee Roasters', areaClaimed: '4 Everton Pk',
      researchedAt: '2026-07-06', sessionQuery: 'Tanjong Pagar, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [
          { tier: 0, source: 'Your Archive, Entries #25\u201327,36', quote: 'FAF Organic, Serra dos Ciganos, Banko Gotiti, Juan Martin' },
          { tier: 'G', source: 'Google review', quote: 'A proper specialty coffee spot' },
        ] },
        'single origin': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'the bean rotation is genuinely impressive' }] },
        'pour over': { level: 'CONFIRMED', evidence: [
          { tier: 0, source: 'Your Archive', quote: 'CORE 54mm grinder, xBloom brewer, 1:17 ratio' },
          { tier: 'G', source: 'Google review', quote: 'Mahlk\u00f6nig CORE grinder into an xBloom precision brewer... brewed at 1:17 across filters, exceptional clarity' },
        ] },
      },
      // Independent reviewer describes the exact grinder/brewer/ratio your own archive recorded.
    },
    {
      candidateName: 'Equate Coffee', areaClaimed: '1 Tanjong Pagar Plz',
      researchedAt: '2026-07-06', sessionQuery: 'Tanjong Pagar, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [{ tier: 0, source: 'Your Archive, Entry #40', quote: 'Huila La Pradera Gesha, Orea V4' }] },
        'single origin': { level: 'CONFIRMED', evidence: [{ tier: 0, source: 'Your Archive, Entry #40', quote: 'Colombia Huila La Pradera Gesha' }] },
        'pour over': { level: 'CONFIRMED', evidence: [{ tier: 0, source: 'Your Archive, Entry #40', quote: 'Orea V4 flat-bottom, 1:14' }] },
      },
      // Tier-0 confirms all three, but the live Google review sample only discusses espresso/
      // matcha/desserts — no corroboration found in this batch. Flagged, not excluded.
    },
    {
      candidateName: 'Baristart Coffee, Tras St', areaClaimed: '65 Tras St',
      researchedAt: '2026-07-06', sessionQuery: 'Tanjong Pagar, Singapore · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'UNCONFIRMED', evidence: [{ tier: 1, source: 'Kaizenaire', quote: 'interesting selection of single-origin beans (unverified)' }] },
        'single origin': { level: 'UNCONFIRMED', evidence: [] },
        'pour over': { level: 'UNCONFIRMED', evidence: [] },
      },
      // 1,708 live reviews, zero mention of single-origin/pour-over — Tier-1 claim rejected.
    },
  ],
};
