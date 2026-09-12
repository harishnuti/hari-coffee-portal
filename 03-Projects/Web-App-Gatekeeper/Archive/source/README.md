# Gatekeeper v3 — Connoisseur Field Kit
Built per GATEKEEPER_V3_ARCHITECTURE.md (golden source). Vite 5 + TypeScript + Preact + IndexedDB PWA.

## Dev
npm install && npm run dev

## Test / Build
npm test        # 12 tests: scoring §4, ground truths App.B, CSV contract §8.3
npm run build   # typecheck + production bundle → dist/

## Deploy
Netlify site: hari-gatekeeper (ID 957fb4ef-b9d7-4554-9ad0-3ba192257866)
Either drag dist/ into the site's Deploys page, or connect this repo (netlify.toml included).

## Data refresh (new archive versions)
Regenerate src/data/master.ts from the latest master CSV/XLSX — see scripts/ note in architecture §8.2.

## API key
Entered at runtime in Settings → stored on-device only. Never commit a key.
