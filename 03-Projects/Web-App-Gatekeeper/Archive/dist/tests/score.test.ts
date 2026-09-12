import { describe, it, expect } from 'vitest';
import { scorePlace, haversineM } from '../src/services/places';

describe('scoring (Architecture §4)', () => {
  it('full match, high rating, deep reviews', () => {
    const r = scorePlace([9, 9], 18, 4.7, 500, 'cafe');
    expect(r.base).toBe(1);
    expect(r.ratingBonus).toBe(0.06);
    expect(r.depthBonus).toBe(0.04);
    expect(r.score).toBe(1); // clamped
  });
  it('partial match arithmetic', () => {
    const r = scorePlace([9], 18, null, 0, 'cafe');
    expect(r.score).toBeCloseTo(0.5, 5);
  });
  it('type penalty applies', () => {
    const r = scorePlace([9, 9], 18, null, 0, 'gas_station');
    expect(r.score).toBeCloseTo(0.85, 5);
  });
  it('mid rating bonus tier', () => {
    const r = scorePlace([5], 10, 4.3, 40, 'coffee_shop');
    expect(r.ratingBonus).toBe(0.03);
  });
});

describe('haversine', () => {
  it('MBS to Changi ≈ 15.5 km', () => {
    const d = haversineM(1.2838, 103.8600, 1.3644, 103.9915);
    expect(d).toBeGreaterThan(14000);
    expect(d).toBeLessThan(18500);
  });
});
