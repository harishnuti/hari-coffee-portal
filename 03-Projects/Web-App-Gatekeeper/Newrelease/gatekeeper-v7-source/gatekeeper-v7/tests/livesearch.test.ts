import { describe, it, expect } from 'vitest';
import { circleToRect, tokenizeDna, scorePlace } from '../src/services/livesearch';

describe('circleToRect', () => {
  it('at equator, 3000m -> dLat roughly 0.02695', () => {
    const rect = circleToRect(0, 0, 3000);
    expect(rect.high.latitude).toBeCloseTo(0.02695, 4);
    expect(rect.high.longitude).toBeCloseTo(0.02695, 4);
  });
  
  it('at lat 60, dLng is 2x dLat', () => {
    const rect = circleToRect(60, 0, 3000);
    const dLat = rect.high.latitude - 60;
    const dLng = rect.high.longitude;
    expect(dLng / dLat).toBeCloseTo(2, 1);
  });
  
  it('output has rectangle-shaped low/high', () => {
    const rect = circleToRect(1.35, 103.8, 3000);
    const json = JSON.stringify({ locationRestriction: { rectangle: rect } });
    expect(json).not.toContain('"circle"');
    expect(json).toContain('"rectangle"');
  });
});

describe('tokenizeDna', () => {
  it('Mahlkönig EK43 (98mm Flat) -> contains ek43, excludes flat and 98mm', () => {
    const tokens = tokenizeDna('Mahlkönig EK43 (98mm Flat)');
    expect(tokens).toContain('ek43');
    expect(tokens).not.toContain('flat');
    expect(tokens).not.toContain('98mm');
  });

  it('Colombia, Huila -> colombia, huila', () => {
    const tokens = tokenizeDna('Colombia, Huila');
    expect(tokens).toEqual(['colombia', 'huila']);
  });

  it('Washed -> washed, Natural -> empty (stoplisted)', () => {
    expect(tokenizeDna('Washed')).toEqual(['washed']);
    expect(tokenizeDna('Natural')).toEqual([]);
  });
});

describe('scorePlace', () => {
  const baseOpts = {
    evidenceKeywords: ['filter', 'v60', 'pourover', 'chemex', 'aeropress', 'masl'],
    archive: [],
    totalWeight: 1,
    filterCoffeeRequired: false,
    originLat: 0,
    originLng: 0
  };

  it('evidence cap: 6 keyword hits still cap evidenceScore at 0.50', () => {
    const raw = {
      id: '1', displayName: { text: 'Cafe' },
      reviews: [{ text: { text: 'filter v60 pourover chemex aeropress masl' } }]
    };
    const place = scorePlace(raw, [], baseOpts);
    expect(place?.scoreBreakdown.evidenceScore).toBeCloseTo(0.50, 2);
  });

  it('filtered water review does NOT match word-boundary filter', () => {
    const raw = {
      id: '1', displayName: { text: 'Cafe' },
      reviews: [{ text: { text: 'they use filtered water' } }]
    };
    const place = scorePlace(raw, [], baseOpts);
    expect(place?.scoreBreakdown.evidenceScore).toBe(0);
  });

  it('archive cross-ref: cafe in archive -> Personally audited + 0.40', () => {
    const raw = { id: '1', displayName: { text: 'Oaks Coffee' } };
    const place = scorePlace(raw, [], {
      ...baseOpts,
      archive: [{ Cafe_Name: 'Oaks Coffee' }]
    });
    expect(place?.filterEvidence).toContain('Personally audited by you');
    expect(place?.scoreBreakdown.evidenceScore).toBe(0.40);
  });

  it('foodHeavy primaryType restaurant -> -0.15', () => {
    const raw = { id: '1', displayName: { text: 'Cafe' }, primaryType: 'restaurant' };
    const place = scorePlace(raw, [], baseOpts);
    expect(place?.scoreBreakdown.typeScore).toBe(-0.15);
  });

  it('filterCoffeeRequired + zero evidence + zero matches -> returns null', () => {
    const raw = { id: '1', displayName: { text: 'Cafe' } };
    const place = scorePlace(raw, [], { ...baseOpts, filterCoffeeRequired: true });
    expect(place).toBeNull();
  });

  it('radius filter integration: distanceM uses originLat/originLng, not null', () => {
    // A place in Tokyo (approx 35.68, 139.76)
    const raw = {
      id: '1', displayName: { text: 'Cafe' },
      location: { latitude: 35.68, longitude: 139.76 }
    };
    // originLat/originLng in Kyoto (approx 35.01, 135.76)
    const place = scorePlace(raw, [], {
      ...baseOpts,
      originLat: 35.01,
      originLng: 135.76
    });
    // Distance should be roughly 370km (370000 meters)
    expect(place?.distanceM).toBeGreaterThan(300000);
    expect(place?.distanceM).toBeLessThan(450000);
    expect(place?.originLat).toBe(35.01);
  });

  it('base never exceeds 1.0 even when matched includes the auto-appended query', () => {
    const rawCafe = { id: '1', displayName: { text: 'Cafe' } };
    const place = scorePlace(rawCafe, ['pour over', 'filter', 'specialty coffee'],
      { ...baseOpts, totalWeight: 3 });
    expect(place!.scoreBreakdown.base).toBeLessThanOrEqual(1.0);
  });

  it('coffeeMentionScore: penalties and bonuses', () => {
    const p1 = scorePlace({ id: '1', reviews: [{text: {text: 'great cocktails'}}, {text: {text: 'fun band'}}, {text: {text: 'nice pizza'}}] }, [], baseOpts);
    expect(p1!.scoreBreakdown.coffeeMention).toBe(-0.25);
    
    const p2 = scorePlace({ id: '2', reviews: [{text: {text: 'best filter coffee'}}, {text: {text: 'barista knows beans'}}] }, [], baseOpts);
    expect(p2!.scoreBreakdown.coffeeMention).toBe(0.15);
  });

  it('nightlife type penalty applied', () => {
    const raw = { id: '1', displayName: { text: 'Bar' }, types: ['bar'] };
    const place = scorePlace(raw, [], baseOpts);
    expect(place!.scoreBreakdown.typeScore).toBe(-0.25);
  });

  it('rating floor penalty applied for 3.5 with >30 reviews', () => {
    const raw = { id: '1', displayName: { text: 'Cafe' }, rating: 3.5, userRatingCount: 94 };
    const place = scorePlace(raw, [], baseOpts);
    expect(place!.scoreBreakdown.ratingBonus).toBe(-0.10);
  });

  it('two tier sorting: verified roaster beats cocktail bar regardless of distance', () => {
    const cocktailBar = scorePlace(
      { id: 'bar', displayName: { text: 'Bar' }, types: ['bar'], location: { latitude: 0, longitude: 0 }, reviews: [{text: {text: 'great cocktails'}}] },
      [],
      { ...baseOpts, originLat: 0, originLng: 0 }
    )!;

    const roaster = scorePlace(
      { id: 'roaster', displayName: { text: 'Roaster' }, primaryType: 'coffee_roastery', location: { latitude: 0.1, longitude: 0.1 } }, // further away
      [],
      { ...baseOpts, originLat: 0, originLng: 0 }
    )!;
    
    const results = [cocktailBar, roaster];
    results.sort((a, b) => {
      const tierA = a.filterEvidence ? 0 : 1;
      const tierB = b.filterEvidence ? 0 : 1;
      if (tierA !== tierB) return tierA - tierB;
      if (b.score !== a.score) return b.score - a.score;
      return a.distanceM - b.distanceM;
    });

    expect(results[0].placeId).toBe('roaster');
    expect(results[1].placeId).toBe('bar');
  });
});
