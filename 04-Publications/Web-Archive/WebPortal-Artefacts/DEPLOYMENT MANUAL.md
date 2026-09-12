# Hari’s Coffee Archive — Deployment Manual

## From Claude’s Handoff to Live Website

**Site already created:** `hari-coffee-archive.netlify.app`
**Site ID:** `43015e0a-c696-435d-a8ab-c9493d1d06b2`
**Files ready:** `DEPLOY_hariscoffee_github_pages.zip`

-----

## STEP 1 — Get Your Files Ready

1. Download `DEPLOY_hariscoffee_github_pages.zip` from Claude
1. Unzip it — you’ll see a folder with **17 files** inside:

```
index.html
nav.js
ARCHIVE_DATA.js
og-meta-patch.js
archive.html
singapore.html
encyclopedia.html
roasters.html
report.html
gallery.html
brew_calculator.html
social_generator.html
404.html
sitemap.xml
robots.txt
README.md
.gitignore
```

Keep this folder open — you’ll need it in Step 3.

-----

## STEP 2 — Log Into Netlify

1. Go to **https://netlify.com**
1. Click **“Log in”** (top right)
1. Sign in with whichever account you used
   when connecting Netlify to Claude
1. You’ll land on your Netlify dashboard

-----

## STEP 3 — Find Your Site

Your site was already created by Claude. Find it:

1. On your dashboard, look for **“hari-coffee-archive”**
1. Click on it
1. You’ll see the site overview page

> If you don’t see it, go to:
> **https://app.netlify.com/projects/hari-coffee-archive**

-----

## STEP 4 — Deploy Your Files (Drag & Drop)

This is the key step:

1. Click the **“Deploys”** tab (top navigation of your site)
1. You’ll see a grey box that says:
   **“Drag and drop your site output folder here”**
1. Open your unzipped folder from Step 1
1. **Select all 17 files** (Cmd+A on Mac / Ctrl+A on Windows)
1. **Drag them into the grey box** in Netlify
1. Wait 30–60 seconds while Netlify uploads

> ⚠️ Important: Drag the FILES, not the folder itself.
> Open the folder first, then select all files inside it.

-----

## STEP 5 — Confirm It’s Live

1. Netlify will show a green **“Published”** status
1. Your URL is live:
   **https://hari-coffee-archive.netlify.app**
1. Click it — you should see your homepage

-----

## STEP 6 — Test Your Website

Visit each page and confirm it works:

|Page             |URL                     |
|-----------------|------------------------|
|Homepage         |`/index.html`           |
|Archive Dashboard|`/archive.html`         |
|Singapore Guide  |`/singapore.html`       |
|Encyclopedia     |`/encyclopedia.html`    |
|Roasters         |`/roasters.html`        |
|Annual Report    |`/report.html`          |
|Gallery          |`/gallery.html`         |
|Brew Calculator  |`/brew_calculator.html` |
|Social Generator |`/social_generator.html`|

Check that:

- ☕ Nav bar appears on every page
- Homepage counters animate on scroll
- City map dots are clickable
- Archive dashboard loads all 31 entries

-----

## HOW TO UPDATE THE SITE LATER

Every time you add new audit entries or Claude
generates updated files, redeploying is easy:

1. Go to **app.netlify.com/projects/hari-coffee-archive**
1. Click **“Deploys”**
1. Drag the new/updated files into the deploy box
1. Netlify automatically publishes the update

> You only need to drag the files that changed —
> but dragging all 17 again is also perfectly fine.

-----

## CUSTOM DOMAIN (Optional — Later)

If you want `hariscoffee.com` instead of
`hari-coffee-archive.netlify.app`:

1. Buy a domain at Namecheap (~SGD 15/year)
1. In Netlify → Site Settings → Domain Management
1. Click “Add custom domain”
1. Follow the DNS instructions Netlify provides
1. HTTPS is automatic — Netlify handles it free

-----

## TROUBLESHOOTING

**Site shows old content:**
→ Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

**Nav bar not showing:**
→ Make sure `nav.js` was included in the upload

**Archive shows no entries:**
→ Make sure `ARCHIVE_DATA.js` was included

**Some pages show 404:**
→ Make sure all 17 files were uploaded, not just some

**Drag and drop not working:**
→ Try a different browser (Chrome works best)
→ Or use Netlify CLI: `npx netlify-cli deploy --prod`

-----

## KEEPING YOUR LOCAL TOOLS

These files are for local use only — do NOT upload to Netlify:

- `bean_tracker.html` — open directly in Chrome
- `coffee_audit_pwa_v2.html` — save to phone home screen
- `visit_planner.html` — open in Chrome before cafe visits
- `palate_trainer.html` — open in Chrome for practice
- `entry_form_v2.html` — use at cafes for logging

-----

## WORKFLOW GOING FORWARD

```
New cafe visit
     ↓
Log entry with entry_form_v2.html (local)
     ↓
Send CSV line to Claude
     ↓
Claude updates master CSV + generates files
     ↓
Drag updated files to Netlify
     ↓
Website updated in 60 seconds
```

-----

*Prepared by Claude — Hari Coffee Archive 2026*
*Site ID: 43015e0a-c696-435d-a8ab-c9493d1d06b2*
*URL: https://hari-coffee-archive.netlify.app*