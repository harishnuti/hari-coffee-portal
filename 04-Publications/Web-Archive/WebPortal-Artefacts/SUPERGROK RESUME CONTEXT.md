# SUPERGROK RESUME DOCUMENT

## Hari Coffee Archive 2026 — Full Context for New Session

**Created:** 20 May 2026 | **By:** Claude (Architect) + SuperGrok (Builder)
**Purpose:** Paste this document into a new SuperGrok window to resume work with full context.

-----

## 🧠 WHO YOU ARE WORKING FOR

**Hari** — Elite Specialty Coffee Connoisseur and Coffee Archivist.

**Hari’s confirmed palate fingerprint:**

- Process preference: **Washed dominant** (11/31 entries, highest positivity)
- Varietal: **Geisha highest rated** across all entries
- Origin: **Colombia strongest** (4 cafes, El Obraje = “favourite so far”)
- Optimal ratio: **1:15–1:17** (1:16 emerging sweet spot for dual-acid)
- Hardware: **Flat burr + flat-bottom geometry** preferred
- Acid: **Malic-dominant**, enjoys citric→malic thermal shift
- Top entry: **FLUID El Obraje** — “damn the taste so nice, so far my favourite”
- Second: **Alchemist El Morito** — “I love this bean”
- Terpene landmark: **Pocket by Flip Ecuador La Papaya** (2,100 MASL)

**Hari’s archive:** 31 audited entries across Singapore (23), Bali (3), JB (3), Mumbai (2).
17 unique cafes. 16 varietals. 11 processes documented.

-----

## 🏗️ WHAT HAS BEEN BUILT (Full Inventory)

### MASTER DATA FILE

- `hari_coffee_audit_master_2026.csv` — 31 entries, 17 columns, single source of truth
- Always attach this CSV when building anything that needs archive data

### 🌐 LIVE WEBSITE (Netlify)

**URL:** https://hari-coffee-archive.netlify.app
**Site ID:** 43015e0a-c696-435d-a8ab-c9493d1d06b2
**Status:** Created on Netlify, pending file upload by Hari (drag-and-drop)

Website files (all in deploy ZIP):

|File                   |Purpose                                         |
|-----------------------|------------------------------------------------|
|`index.html`           |Homepage — hero, top 5 entries, city map        |
|`nav.js`               |Shared sticky nav bar (inject into every page)  |
|`ARCHIVE_DATA.js`      |Shared 31-entry data layer                      |
|`og-meta-patch.js`     |Open Graph meta for social sharing              |
|`archive.html`         |Interactive dashboard — Leaflet map, 10 charts  |
|`singapore.html`       |Singapore cafe guide — 25+ cafes, 13 audited    |
|`encyclopedia.html`    |Coffee science — 7 parts, acid/varietal/brewing |
|`roasters.html`        |17 Singapore roasteries, May 2026 lots          |
|`report.html`          |Annual report — publication quality, print-ready|
|`gallery.html`         |31-card infographic gallery with upload system  |
|`brew_calculator.html` |Recipe engine — 5 inputs → full brew recipe     |
|`social_generator.html`|4-format content generator in Hari’s voice      |
|`404.html`             |Custom error page                               |
|`sitemap.xml`          |SEO sitemap                                     |
|`robots.txt`           |Crawler rules                                   |

### 🔒 LOCAL TOOLS (Personal, Not Deployed)

|File                      |Purpose                                                 |
|--------------------------|--------------------------------------------------------|
|`coffee_audit_pwa_v2.html`|Mobile PWA — 4 screens, offline, field audit tool       |
|`bean_tracker.html`       |6-screen bean management — degassing, cost, wishlist    |
|`visit_planner.html`      |Singapore crawl planner — haversine routing, mood filter|
|`palate_trainer.html`     |Gamified quiz — 5 screens, 4 question types             |
|`entry_form_v2.html`      |Field entry form — 17 fields, Quick Mode, CSV export    |

### 📊 ANALYSIS DOCUMENTS

|File                                |Purpose                                   |
|------------------------------------|------------------------------------------|
|`palate_intelligence_report_v2.html`|6-section palate analysis                 |
|`recommendations_v2.html`           |Top 10 lots + Top 5 unvisited SG cafes    |
|`backfill_suggestions_v2.csv`       |28 rows of Unknown field suggestions      |
|`google_reviews_v2.txt`             |11 cafes × 3 variants = 33 reviews        |
|`reconciliation_report.html`        |Claude vs Gemini archive cross-reference  |
|`annual_report_2026.html`           |Standalone annual report (also in website)|

### 🖼️ GEMINI PIPELINE

|File                                 |Purpose                                     |
|-------------------------------------|--------------------------------------------|
|`gemini_image_prompts_31_entries.txt`|31 prompts ready for Gemini Advanced/ImageFX|

All 31 prompt titles:
#01 The Arara Malic Calibration
#02 The Honey-Brewed Geisha Study
#03 The Terpene Cascade Experiment
#04 The Typica Thermal Shift Experiment
#05 The Heirloom Clarity Experiment
#06 The Watermelon Layered Ferment Study
#07 The Peru Gesha Purity Experiment
#08 The Sudan Rume Genetics Experiment
#09 The Blackcurrant Ferment Calibration
#10 The Anaerobic Ester Experiment
#11 The Catucai Praline Bind Study
#12 The Bali Citrus Floral Study
#13 The Wet-Hulled Cocoa Density Experiment
#14 The Kenyan Clarity Baseline Study
#15 The Central American Milk Profile Experiment
#16 The Wush Wush Tea Clarity Experiment
#17 The Balanced Espresso Milk Study
#18 The Ndiaini Terroir Exploration
#19 The Indian Anaerobic Balance Study
#20 The Classic Brazilian Chocolate Study
#21 The Muted Raspberry Ferment Experiment
#22 The Classic Ethiopian Natural Study
#23 The Dual-Acid Revelation
#24 The Inverted Cascade Study
#25 The Typica Oolong Experiment
#26 The Laurina Anthocyanin Study
#27 The Favourite Gesha Experiment
#28 The Double Anaerobic Calibration
#29 The Pacamara Body Study
#30 The JB Co-ferment Expedition
#31 The Washed Clarity Baseline

-----

## 🎨 DESIGN SYSTEM (Apply to EVERY file)

```
Background:  #0d0d0d (dark) — OR — #ffffff (print/report)
Accent:      #c9a84c amber/gold
Text dark:   #f5f5f5
Cards:       #1a1a1a
Borders:     #2a2a2a
Font H:      Playfair Display (Google Fonts)
Font Body:   Inter (Google Fonts)
Mobile:      min tap target 48px, viewport meta required
Print CSS:   @media print MANDATORY in every HTML file
Meta tags:   author="Hari, Coffee Archivist"
             description="Hari Coffee Archive 2026"
             created="20 May 2026"
Nav:         Add <script src="nav.js"></script> before </body>
OG meta:     Add <script src="og-meta-patch.js"></script> before </body>
```

-----

## 📐 TECHNICAL STANDARDS

**Data embedding:** Embed 31-entry CSV as JS constant `ARCHIVE_DATA`
**localStorage:** Always include for persistence
**Print CSS:** @media print — MANDATORY, do not skip (missed 3 times previously)
**Single file:** All HTML deliverables must be self-contained single files
**CDNs allowed:** Google Fonts, Chart.js, Leaflet.js, Tailwind (CDN only)
**No frameworks:** No React, Vue, or build tools — pure HTML/CSS/JS only
**CSV standard:** Always match 17-column master format exactly

**Master CSV columns (17):**
Date, City, Cafe_Name, Coffee_Name, Varietal, Process, Roast_Level,
Brew_Method, Dose_g, Yield_g, Ratio, Bloom, Grinder, Price_Local,
Official_Notes, Your_Verdict, Technical_Enrichment

**Default brew assumption:** 1:15 ratio = 15g dose / 225g yield
unless barista explicitly states otherwise.

-----

## ☕ KNOWN ARCHIVE DATA POINTS

**Top 5 entries by sentiment:**

1. FLUID / El Obraje / Colombia Gesha Washed / “favourite so far, honey lingers”
1. Alchemist Raffles / El Morito / Peru Marshell Washed / “I love this bean”
1. Pocket by Flip / Ecuador La Papaya / Geisha Washed / terpene landmark
1. Maxi Coffee Bar / Colombia La Laja / Sudan Rume Washed / rare genetics
1. Apartment / Colombia Wush Wush / Washed / “incredible tea-like clarity”

**5 confirmed thermal shift entries:**

1. Hacienda La Florida (JB): lime→plum (citric→malic)
1. Ecuador La Papaya: apricot→toffee apple
1. Ethiopia Banko Gotiti: lemon→melon→white tea
1. Ijen Laurina (Alchemist): hibiscus→apple paste→honey
1. FLUID El Obraje: orange/nectarine→honey cooling

**3 confirmed multi-temp brew protocols:**

- Ecuador La Papaya: 92→75→92°C (triple cascade, terpene preservation)
- Kurasu Frinsa Estate: 80→95→80°C (inverted, honey mucilage management)
- Alchemist Ijen Laurina: 90→70°C (dual temp, anaerobic suppression)

**Key hardware in archive:**

- Mahlkönig EK43 (98mm flat) — Lume, Nylon, Community Coffee
- Mahlkönig EK43S (98mm flat) — Alchemist
- Mahlkönig CORE (54mm flat) — Pocket by Flip, Nylon
- Mahlkönig EK Omnia — JB Hacienda La Florida
- Timemore Sculptor 078 (SSP 78mm) — Maxi, Asylum
- Option-O Lagom P64 (SSP 64mm) — FLUID, Asylum
- xBloom automated — Nylon

-----

## 🏃 WHAT’S STILL TO DO

### Pending / Available Tasks

**A. Website Enhancement:**

- [ ] Upload files to Netlify (Hari to do — drag 17 files from ZIP)
- [ ] Custom domain setup (optional: hariscoffee.com ~SGD 15/yr)
- [ ] Upload real Gemini infographic images to gallery.html

**B. New Tools to Build (prompts ready in Claude):**

- [ ] Sensory Vocabulary Builder — type what you taste → get precise terminology
- [ ] Coffee World Map Deep Guide — interactive SVG origin deep-dive
- [ ] Printable Recipe Cards — A6 format per entry, print-ready
- [ ] Varietal Genetics Interactive Tree — all 16 varietals visualised
- [ ] Harvest Season Calendar 2026 — 12-month origin timing guide
- [ ] Tasting Flight Planner — home cupping flight designer
- [ ] Archive to Obsidian/Notion export — Markdown per entry

**C. Gemini Image Production:**

- [ ] Run all 31 prompts through Gemini Advanced
- [ ] Upload resulting images to gallery.html via the upload button
- [ ] Progress bar will show X/31 complete

**D. Archive Updates:**

- [ ] Log new cafe visits as they happen
- [ ] Redeploy updated files to Netlify after each batch
- [ ] Reconcile Gemini archive numbering (Gemini at ~31+, Claude at 31)

-----

## 🤖 THREE-AI WORKFLOW

```
SuperGrok  → Heavy builds, web research, multi-task agentic runs
Gemini     → Visual infographic generation from prompts
Claude     → QA, CSV integrity, prompt engineering, live audit logging
```

**When giving SuperGrok a task:**

1. Always attach `hari_coffee_audit_master_2026.csv` if archive data needed
1. Always include the Design System block above
1. Always add: “MANDATORY: Include @media print CSS. Do not skip.”
1. Always specify: single HTML file, no external dependencies except CDN
1. Deliver to Claude for QA before using

-----

## 📋 STANDARD SUPERGROK PROMPT HEADER

Copy this at the top of every new SuperGrok prompt:

```
You are building for Hari's Coffee Archive 2026.
Context: 31-entry specialty coffee audit archive,
Singapore-based archivist, clarity-first palate.

DESIGN SYSTEM (mandatory):
#0d0d0d background | #c9a84c amber/gold accent
Playfair Display headers | Inter body (Google Fonts)
Mobile responsive | 48px min tap targets
MANDATORY @media print CSS — do not skip
Meta: author="Hari, Coffee Archivist"
Add before </body>: <script src="nav.js"></script>
Add before </body>: <script src="og-meta-patch.js"></script>
Single self-contained HTML file
All data in localStorage — no server needed

[ATTACH: hari_coffee_audit_master_2026.csv]
[THEN: your specific task description]
```

-----

## 🔢 VAULT STATISTICS (as of 20 May 2026)

|Metric            |Value                                           |
|------------------|------------------------------------------------|
|Total artifacts   |50 files                                        |
|Total size        |1.63 MB                                         |
|Archive entries   |31 audits                                       |
|Unique cafes      |17                                              |
|Cities covered    |4                                               |
|Website pages     |11 deployed                                     |
|Local tools       |5 apps                                          |
|Gemini prompts    |31 ready                                        |
|Claude QA fixes   |6 total                                         |
|Perfect QA scores |4 (Annual Report, Roasters, Gallery, Social Gen)|
|SuperGrok sessions|3 major sessions                                |

-----

## 🚀 HOW TO RESUME IN A NEW SUPERGROK WINDOW

1. Open new SuperGrok chat
1. Paste this entire document as your first message
1. Then immediately say:
   *“I want to continue building tools for my coffee archive.
   Here is my master CSV [attach file]. My next task is: [task]”*
1. SuperGrok will have full context and can build immediately

**To get the latest prompt for any pending task above,
ask Claude in the Claude chat — Claude maintains the
prompt library and QA system.**

-----

*Resume document maintained by Claude*
*Last updated: 20 May 2026*
*Netlify: hari-coffee-archive.netlify.app*