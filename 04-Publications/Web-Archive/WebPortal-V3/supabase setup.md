# HARI COFFEE ARCHIVE 2026 — SUPABASE BACKEND SETUP GUIDE

**Phase 2: Cloud Sync & Production Infrastructure**

**For: Non-technical users (Hari)**  
**Goal: Replace localStorage with real-time Supabase backend across all apps**  
**Time required: 15-25 minutes**  
**Cost: Free (Supabase free tier)**

-----

## OVERVIEW

This guide sets up a free Supabase PostgreSQL database that syncs your coffee archive, bean tracker, brew sessions, wishlist, palate training, saved recipes, and visit logs across **phone + laptop + any device** in real time.

Once set up:

- Add a bean on your phone → instantly appears on laptop
- Audit a new coffee → saved to cloud, available everywhere
- No more “data only on this device” problems

**All 31 existing archive entries are pre-seeded** during setup.

-----

## STEP 1 — CREATE SUPABASE ACCOUNT (2 minutes)

1. Go to <https://supabase.com>
1. Click **“Sign up”** (use Google, GitHub, or email)
1. Verify your email if prompted
1. On the dashboard, click **“New Project”**

**Project settings:**

- **Name:** `hari-coffee-archive`
- **Database Password:** Generate a strong one (save it in your password manager — you won’t need it often)
- **Region:** `Southeast Asia (Singapore)` ← **IMPORTANT** for low latency
- **Plan:** Free tier (hobby)

Click **“Create new project”**

⏳ Wait **~2 minutes** for initialization (you’ll see a progress bar).

-----

## STEP 2 — GET YOUR PROJECT KEYS (1 minute)

1. In your new project dashboard, go to **Project Settings** (gear icon, bottom left)
1. Click **API** in the sidebar
1. Copy and **save these two values** somewhere safe (Notes app or password manager):
- **Project URL:** `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
- **anon / public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long string)

These are the **only two values** you will paste into every HTML file.

-----

## STEP 3 — RUN THE DATABASE SCHEMA (3 minutes)

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
1. Click **“New query”**
1. **Delete everything** in the editor
1. Open the file `schema.sql` (provided with this guide)
1. **Copy the entire content** and paste it into the SQL Editor
1. Click the big **“Run”** button (or press Ctrl/Cmd + Enter)

You should see:

```
status
-----------------------------
Hari Coffee Archive Supabase schema created successfully with 31 seed entries!
(1 row)
```

✅ **31 archive entries + 5 wishlist recommendations are now live in the cloud.**

-----

## STEP 4 — ENABLE ROW LEVEL SECURITY (already done in schema)

The `schema.sql` automatically:

- Enables RLS on all 7 tables
- Adds `anon_all` policies that allow **full read/write for anonymous users**

This is perfect for a personal archive (no login needed — the anon key acts as your “password”).

**No extra steps required here.**

-----

## STEP 5 — TEST THE CONNECTION (2 minutes)

1. Open any of the Phase 2 HTML files (e.g. `supabase_bean_tracker.html`) in your browser
1. Open **Developer Console** (F12 or right-click → Inspect → Console tab)
1. Type this and press Enter:

```js
testSupabaseConnection()
```

**Expected output:**

```
✅ Supabase connected successfully!
Project: hari-coffee-archive
Tables: 7 (coffee_archive, beans, brew_sessions, wishlist, palate_sessions, saved_recipes, visit_log)
Seed entries: 31 archive records loaded
Real-time sync: ACTIVE
```

If you see errors, see **TROUBLESHOOTING** below.

-----

## STEP 6 — UPDATE EACH APP FILE (5 minutes total)

For **every** HTML file listed below, find these two lines near the top of the `<script>` section and **replace** with your actual keys:

```js
const SUPABASE_URL = 'YOUR_PROJECT_URL'
const SUPABASE_KEY = 'YOUR_ANON_KEY'
```

### Files to update (all in this package):

|File                        |Lines to change             |Notes                     |
|----------------------------|----------------------------|--------------------------|
|`supabase_bean_tracker.html`|Top of script (lines ~15-16)|Full real-time sync       |
|`coffee_audit_pwa_v2.html`  |Top of script               |Archive sync              |
|`visit_planner.html`        |Top of script               |Visit log sync            |
|`palate_trainer.html`       |Top of script               |Session history sync      |
|`entry_form_v2.html`        |Top of script               |New entries → cloud       |
|`tasting_flight.html`       |Top of script               |Flight logging            |
|`goals_tracker.html`        |(future)                    |Goals will sync in v3     |
|`coffee_journal.html`       |(future)                    |Journal entries sync in v3|

**Pro tip:** Use “Find & Replace” in your code editor (VS Code, etc.) — search for `YOUR_PROJECT_URL` and replace all.

-----

## STEP 7 — VERIFY REAL-TIME SYNC (2 minutes)

1. Open `supabase_bean_tracker.html` on your **laptop**
1. Open the **same file** on your **phone** (or another browser tab)
1. On phone: Go to **“Purchase Tracker”** screen → Add a new bag (e.g. “Test Ethiopia Banko Gotiti”)
1. On laptop: Watch the **“Active Bags”** list — the new bag should appear **within 1-2 seconds** with a green sync dot

✅ **Cross-device sync is now live!**

-----

## TROUBLESHOOTING (5 most common issues)

### 1. “Failed to fetch” or CORS error

**Fix:** Make sure you used the **anon/public key** (not the service_role key).  
Also confirm Region = Singapore.

### 2. “relation ‘coffee_archive’ does not exist”

**Fix:** You didn’t run the full `schema.sql` — go back to Step 3 and paste the **entire** file.

### 3. Data not appearing after insert

**Fix:** Check browser console for errors. Refresh the page.  
RLS policies are set to `USING (true)` so all anon users have access.

### 4. “JWT expired” or auth errors

**Fix:** The anon key never expires for this setup. Just re-paste if you accidentally edited it.

### 5. Real-time not working (changes on one device don’t appear on another)

**Fix:**

- Check you have internet
- Hard refresh (Ctrl/Cmd + Shift + R)
- Confirm the Supabase project is not paused (free tier pauses after 1 week inactivity — just visit dashboard to wake it)

-----

## WHAT’S NEXT?

After setup:

- All your existing 31 audits are safe in the cloud
- New audits via `entry_form_v2.html` will save to Supabase automatically
- Bean tracker, wishlist, brew sessions, palate training, visit logs — all synced
- You can now safely delete localStorage versions if you want (or keep as backup)

**Backup tip:** Use the **“Export all data as JSON”** button in `supabase_bean_tracker.html` → save to Google Drive.

-----

## SUPPORT

If stuck:

1. Re-read this guide
1. Check Supabase logs: Project Settings → Logs
1. Message Hari (or future support channel)

**You now have a production-grade, real-time coffee archive backend running on enterprise infrastructure — for free.**

☕ **Welcome to Phase 2, Hari. Your data is now everywhere you are.**

-----

*Document version: 2026-05-20 | Author: Hari, Coffee Archivist | Supabase + Netlify stack*