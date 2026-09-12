import { describe, it, expect } from 'vitest';
import { MASTER } from '../src/data/master';
import { auditsToCSV, CSV_HEADER, csvCell } from '../src/services/export';

describe('ground truths (Architecture Appendix B, updated 06Jul)', () => {
  it('53 entries', () => expect(MASTER.length).toBe(53));
  it('29 unique cafés', () => expect(new Set(MASTER.map(e => e.cafe)).size).toBe(29));
  it('17 starred', () => expect(MASTER.filter(e => e.star).length).toBe(17));
  it('Fluid Collective has 3 entries after normalization', () =>
    expect(MASTER.filter(e => e.cafe === 'Fluid Collective').length).toBe(3));
  it('price mean sane', () => {
    const ps = MASTER.map(e => e.priceSGD).filter((p): p is number => p !== null);
    const avg = ps.reduce((a, b) => a + b, 0) / ps.length;
    expect(avg).toBeGreaterThan(9); expect(avg).toBeLessThan(12);
  });
});

describe('CSV contract (§8.3)', () => {
  it('quotes cells containing commas/quotes', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('plain')).toBe('plain');
  });
  it('emits master header and ordered fields', () => {
    const csv = auditsToCSV([{ id: 'x', capturedAt: '', Date: '2026-07-06', City: 'Singapore', Cafe_Name: 'Test, Cafe', Coffee_Name: 'C', Producer_Farm: 'U', Origin: 'U', Varietal: 'U', Process: 'U', Roast_Level: 'Light', Brew_Method: 'U', Dose_g: '15', Yield_g: '225', Ratio: '1:15', Water_Temp_C: '92', Bloom: 'U', Grinder: 'U', Price_SGD: '9', Official_Notes: 'U', Your_Verdict: 'V', Technical_Enrichment: 'Pending Claude enrichment', Visit_Context: 'ctx', Source: 'Gatekeeper Field Kit' } as never]);
    expect(csv.startsWith(CSV_HEADER + '\n')).toBe(true);
    expect(csv).toContain('"Test, Cafe"');
    expect(csv.split('\n')[1].split(',')[0]).toBe('2026-07-06');
  });
});
