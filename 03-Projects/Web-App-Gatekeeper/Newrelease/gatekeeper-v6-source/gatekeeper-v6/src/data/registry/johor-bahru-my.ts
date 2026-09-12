import type { Registry } from './types';

export const JOHOR_BAHRU_MY: Registry = {
  city: 'Johor Bahru', area: 'City-wide', slug: 'johor-bahru-my',
  keywordSet: ['specialty coffee', 'pour over', 'single origin', 'V60'],
  generatedBy: 'claude-research-session', schemaVersion: 1,
  entries: [
    {
      candidateName: 'Sweet Blossom Coffee Roasters', areaClaimed: '28 Jalan Maju, Taman Pelangi',
      researchedAt: '2026-07-06', sessionQuery: 'Johor Bahru · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [
          { tier: 1, source: 'ShiokGuide', quote: 'one of JB\u2019s best specialty coffee spots since 2015' },
          { tier: 'G', source: 'Google review', quote: 'Best speciality coffee shop in JB central' },
        ] },
        'single origin': { level: 'CONFIRMED', evidence: [
          { tier: 1, source: 'ShiokGuide', quote: 'rotating menu of single-origin beans' },
          { tier: 'G', source: 'Google review', quote: 'seasonal single origin beans... Kenya AA Filtered Coffee (Washed)' },
        ] },
        'pour over': { level: 'CONFIRMED', evidence: [
          { tier: 1, source: 'Lemon8', quote: 'best pour over coffee in JB. Hands down the best coffee we tried' },
          { tier: 'G', source: 'Google review', quote: 'Kenya AA Filtered Coffee (Washed)... well brewed, tea-like texture' },
        ] },
      },
    },
    {
      candidateName: 'Clod Coffee Bar & Roasters', areaClaimed: '123 Jln Beringin, Taman Melodies',
      researchedAt: '2026-07-06', sessionQuery: 'Johor Bahru · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'CONFIRMED', evidence: [
          { tier: 1, source: 'Official site', quote: 'serving the best specialty coffee' },
          { tier: 'G', source: 'Google review', quote: 'Highly recommend this place for anyone who is into specialty coffee' },
        ] },
        'single origin': { level: 'CONFIRMED', evidence: [{ tier: 1, source: 'DanielFoodDiary', quote: 'Casa Blanca Geisha, Colombia \u201cOrange Grape Juice\u201d, Hacienda La Papaya Sidra, Ecuador' }] },
        'pour over': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'flexibility for black, white, filter' }] },
      },
      // The pour-over confirmation was found only at Step 2 — Step 1 alone left this at 2/3.
    },
    {
      candidateName: 'Sunday Morning Coffee Shop', areaClaimed: '124 Jalan Trus',
      researchedAt: '2026-07-06', sessionQuery: 'Johor Bahru · specialty/pour over/single origin/V60',
      concepts: {
        'specialty coffee': { level: 'UNCONFIRMED', evidence: [] },
        'single origin': { level: 'UNCONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'Blend No. 3 hand-drip — a house blend, not single-origin' }] },
        'pour over': { level: 'CONFIRMED', evidence: [{ tier: 'G', source: 'Google review', quote: 'Tried the Blend No. 3 hand-drip' }] },
      },
      // 4.5\u2605, 554 reviews — genuinely popular, correctly excluded: house blend, not the criteria.
    },
  ],
};
