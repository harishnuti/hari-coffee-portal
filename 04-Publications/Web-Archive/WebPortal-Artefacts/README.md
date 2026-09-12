# Hari’s Coffee Archive 2026 — GitHub Pages Deployment Guide

**For non-technical users — follow these exact steps.**

-----

## Step 1: Create a Free GitHub Account

1. Go to <https://github.com>
1. Click the green **“Sign up”** button (top right).
1. Enter your email, create a username (example: `hariscoffee`), and set a password.
1. Verify your email address.
1. You now have a GitHub account.

-----

## Step 2: Create a New Repository

1. After logging in, click the **+** icon (top right) → **New repository**.
1. Repository name: **`coffee-archive`** (must be exactly this or your username.github.io if you want root domain).
1. Description: `Hari's Coffee Archive 2026 — 31 specialty coffee audits`
1. Set to **Public**.
1. **Do NOT** check “Add a README file” (we will upload our own).
1. Click **Create repository**.

You will now see an empty repository page.

-----

## Step 3: Upload All Files

**Option A – Easy Drag & Drop (Recommended for beginners)**

1. On your new repository page, click the **“uploading an existing file”** link (or the **Add file → Upload files** button).
1. Drag and drop **all files** from this folder into the browser window:
- index.html
- archive.html
- singapore.html
- encyclopedia.html
- roasters.html
- report.html
- gallery.html
- brew_calculator.html
- social_generator.html
- nav.js
- ARCHIVE_DATA.js
- README.md
- .gitignore
- sitemap.xml
- robots.txt
- 404.html
- og-meta-patch.js
1. Scroll down and click the green **“Commit changes”** button.
1. Wait 10–30 seconds for upload to complete.

**Option B – Using GitHub Desktop (if you prefer desktop app)**

1. Download and install [GitHub Desktop](https://desktop.github.com).
1. Clone your new repository.
1. Copy all files into the folder.
1. Commit and push.

-----

## Step 4: Enable GitHub Pages

1. Go to your repository: `https://github.com/YOUR_USERNAME/coffee-archive`
1. Click **Settings** (top right, next to your profile picture).
1. In the left sidebar, click **Pages**.
1. Under “Build and deployment”:
- **Source**: Select **Deploy from a branch**
- **Branch**: Select `main` (or `master`)
- **Folder**: Select `/ (root)`
1. Click **Save**.

GitHub will now build your site. This usually takes **1–2 minutes**.

-----

## Step 5: Access Your Live Website

Your site will be live at:

**https://YOUR_USERNAME.github.io/coffee-archive**

Example: If your username is `hariscoffee`, the URL is:
**https://hariscoffee.github.io/coffee-archive**

-----

## Step 6: (Optional but Recommended) Add Custom Domain

If you own a domain (e.g. `hariscoffee.com`):

1. In Settings → Pages, scroll to “Custom domain”.
1. Enter your domain and follow GitHub’s DNS instructions (usually add a `CNAME` record).

-----

## Troubleshooting

- **404 error?** Make sure `index.html` is in the root (not inside a folder).
- **Changes not showing?** Wait 1–2 minutes or hard-refresh (Ctrl + Shift + R).
- **Images not loading?** All images are generated via SVG — no external files needed.

-----

## What’s Included in This Package

- Beautiful dark/gold landing page (`index.html`)
- Full archive dashboard, Singapore guide, encyclopedia, roaster intel, annual report
- Interactive gallery with 31 Gemini-style infographics + local upload
- Brew Calculator (smart recipe engine)
- Social Content Generator (Instagram, X, Google Maps content in Hari’s voice)
- Shared navigation bar on every page
- Shared archive data
- SEO files (sitemap, robots.txt)
- Custom 404 page
- Open Graph meta tags for beautiful link previews on WhatsApp, Twitter, Facebook

-----

**You now have a professional, fully functional specialty coffee archive website live on the internet — for free.**

Congratulations, Hari.

— Built with Claude + SuperGrok + Gemini