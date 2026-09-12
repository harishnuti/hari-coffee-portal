import fs from 'fs';
import path from 'path';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const headers = lines[0].split(',').map(h => h.trim());
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    const data = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < row.length; j++) {
      const char = row[j];
      if (char === '"' && row[j + 1] === '"') {
        current += '"';
        j++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        data.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    data.push(current);
    
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = data[idx]?.trim() ?? '';
    });
    results.push(obj);
  }
  return results;
}

const csvPath = process.argv[2];
const outPath = process.argv[3];

if (!csvPath || !outPath) {
  console.error("Usage: node csv-to-master.js <input.csv> <output.ts>");
  process.exit(1);
}

const csvText = fs.readFileSync(csvPath, 'utf-8');
const records = parseCSV(csvText);

const entries = records.map((r, i) => {
  const isGesha = r['Gesha_Alert'] && r['Gesha_Alert'].includes('GESHA');
  const star = isGesha ? 1 : 0; // simplistic star mapping based on user's column

  // Map Brew_Method to geom
  const brewLower = r['Brew_Method'].toLowerCase();
  let geom = 'unknown';
  if (brewLower.includes('flat') || brewLower.includes('alpha') || brewLower.includes('orea') || brewLower.includes('april') || brewLower.includes('xbloom')) geom = 'flat';
  else if (brewLower.includes('conical') || brewLower.includes('v60') || brewLower.includes('origami')) geom = 'conical';
  else if (brewLower.includes('immersion') || brewLower.includes('switch')) geom = 'immersion';
  else if (brewLower.includes('espresso') || brewLower.includes('piccolo') || brewLower.includes('flat white') || brewLower.includes('cortado') || brewLower.includes('magic')) geom = 'milk';
  else if (brewLower.includes('pour') || brewLower.includes('filter')) geom = 'pour';

  let ratioValue = null;
  const ratioRaw = r['Ratio'];
  if (ratioRaw && ratioRaw.includes(':')) {
    const parts = ratioRaw.split(':');
    ratioValue = parseFloat(parts[1]);
  }

  let priceSGD = null;
  if (r['Price_SGD'] && r['Price_SGD'] !== 'Unknown') {
    priceSGD = parseFloat(r['Price_SGD']);
  }

  return {
    n: i + 1,
    dateISO: r['Date'],
    cafe: r['Cafe_Name'],
    city: r['City'],
    coffee: r['Coffee_Name'],
    farm: r['Producer_Farm'],
    originCountry: r['Origin']?.split(',').pop()?.trim() || r['Origin'], // approximation
    originRegion: r['Origin'],
    varietal: r['Varietal'],
    process: r['Process'],
    roast: r['Roast_Level'],
    brew: r['Brew_Method'],
    geom,
    ratioLabel: r['Ratio'] && r['Ratio'] !== 'Unknown' ? r['Ratio'] : '—',
    ratioValue: isNaN(ratioValue) ? null : ratioValue,
    temp: r['Water_Temp_C'] && r['Water_Temp_C'] !== 'Unknown' ? r['Water_Temp_C'] : '—',
    tempClass: 'unknown', // simplifying
    grinder: r['Grinder']?.substring(0, 15) || 'Unknown',
    grinderFull: r['Grinder'],
    grinderClass: r['Grinder']?.includes('98mm') ? '98mm flat' : (r['Grinder']?.includes('flat') ? 'flat' : '—'),
    dose: r['Dose_g'],
    yieldG: r['Yield_g'],
    bloom: r['Bloom'],
    priceSGD: isNaN(priceSGD) ? null : priceSGD,
    notes: r['Official_Notes'],
    verdict: r['Your_Verdict'],
    context: r['Visit_Context'],
    star
  };
});

const fileContent = `// GENERATED from ${path.basename(csvPath)} — do not hand-edit. Regenerate via scripts/csv-to-master.js
export interface MasterEntry{n:number;dateISO:string;cafe:string;city:string;coffee:string;farm:string;originCountry:string;originRegion:string;varietal:string;process:string;roast:string;brew:string;geom:string;ratioLabel:string;ratioValue:number|null;temp:string;tempClass:string;grinder:string;grinderFull:string;grinderClass:string;dose:string;yieldG:string;bloom:string;priceSGD:number|null;notes:string;verdict:string;context:string;star:number}
export const MASTER:MasterEntry[]=${JSON.stringify(entries)};
`;

fs.writeFileSync(outPath, fileContent);
console.log(`Wrote ${entries.length} entries to ${outPath}`);
