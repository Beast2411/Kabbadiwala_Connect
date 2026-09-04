# Backend + Database + Auth — Step-by-Step Free Build Guide
For Person 3 (Backend/DB Lead), using Supabase + AI coding assistants, ₹0 cost.

---

## STEP 1: Create the Supabase Project (5 min)

1. Go to [supabase.com](https://supabase.com) → Sign up free (GitHub login is fastest)
2. Click **New Project**
3. Name it `kabadiwala-connect`, set a database password (save it somewhere), pick the
   region closest to India (e.g. `ap-south-1` / Mumbai if available)
4. Wait ~2 minutes for provisioning
5. Once ready, go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key
   These go into your Next.js `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Free tier covers:** 500MB database, 1GB file storage, 50,000 monthly active users,
unlimited API requests. More than enough for a hackathon.

---

## STEP 2: Design and Create the Schema (AI-assisted)

Open the **SQL Editor** in Supabase, then use your AI coding assistant (Claude Code,
Cursor, ChatGPT, whatever you have) with this exact prompt:

> "Generate PostgreSQL CREATE TABLE statements for a Supabase project called
> Kabadiwala Connect. I need these 6 tables with UUID primary keys, created_at
> timestamps, and appropriate foreign keys between them:
>
> 1. collectors: id, phone, name, preferred_language, location_lat, location_lng, created_at
> 2. recyclers: id, name, location_lat, location_lng, materials_accepted (text array),
>    authorized (boolean), registration_id, contact, offered_rates (jsonb), pickup_available (boolean), created_at
> 3. materials: id, category, sub_category, description, image_url, weight_kg, condition, created_at
> 4. lots: id, collector_id (FK to collectors), materials (jsonb array), total_weight,
>    estimated_value, status (enum: created/matched/handed_over/paid), photo_urls (text array),
>    gps_lat, gps_lng, created_at
> 5. prices: id, material_category, location, price_date, buying_price, quoted_price,
>    unit, recycler_id (FK to recyclers, nullable), created_at
> 6. transactions: id, lot_id (FK to lots), recycler_id (FK to recyclers), quoted_price,
>    final_price, handover_ref, payment_status, created_at, updated_at
>
> Also add a 7th table 'traceability' with: id, lot_id (FK), photo_urls, weight, timestamp,
> gps_lat, gps_lng, handover_reference_number, recycler_confirmed (boolean), status.
>
> Add appropriate indexes on foreign keys and frequently-queried columns like location
> and status."

Paste the generated SQL into Supabase's SQL Editor and run it. Fix any syntax errors by
pasting the error back to your AI assistant.

---

## STEP 3: Set Up Row Level Security (RLS) — Important, Don't Skip

By default Supabase blocks all access until you add policies. Prompt your AI assistant:

> "Write Supabase RLS policies for these tables: collectors should only be able to read
> and update their own row (matched by auth.uid()). Lots should be readable/writable
> only by the collector who created them, but recyclers should be able to read lots
> that have been matched to them. Recyclers should only be able to update their own
> profile. Prices and materials tables should be publicly readable by anyone
> (authenticated or not) since they're reference data."

Run the generated policies in the SQL Editor. Enable RLS on each table first:
```sql
ALTER TABLE collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
-- etc for each table
```

---

## STEP 4: Set Up Authentication (Free, No SMS Cost)

Avoid phone/SMS OTP — Supabase's SMS auth requires a paid Twilio account. Use one of
these free alternatives instead:

### Option A (recommended): Magic Link Email Auth
1. In Supabase Dashboard → **Authentication → Providers**, ensure **Email** is enabled
   (it is by default)
2. Prompt your AI assistant: "Write a Next.js sign-in component using Supabase's
   `signInWithOtp` method for magic link email authentication, with a simple form for
   entering email and a confirmation screen"
3. Free, no card needed, works reliably

### Option B: Simple PIN-based Auth (better for low-literacy collectors without email)
1. Skip Supabase Auth's built-in flow — instead, prompt your AI assistant:
   "Write a simple custom auth flow: collector enters their phone number, the app
   generates a 4-digit PIN stored (hashed) in the collectors table, and creates a
   Supabase session using a custom JWT via a serverless function"
2. This is a bit more setup but matches the target users better — decide as a team
   which fits your demo best. **For a hackathon demo, Option A (magic link) is faster
   to implement and perfectly acceptable** since judges care about the concept, not
   production-grade auth.

### Recycler Auth
Simple email/password via Supabase Auth (`signUp` / `signInWithPassword`) — recyclers
are businesses, not low-literacy users, so standard auth is fine here.

---

## STEP 5: Generate the Matching/Ranking API (AI-assisted)

Prompt your AI assistant:

> "Write a Next.js API route (`/api/match-recyclers`) that takes a lot's material
> category and GPS coordinates, queries the Supabase 'recyclers' table, filters to
> only authorized recyclers who accept that material category, calculates distance
> using the Haversine formula, and returns the top 5 recyclers ranked by a weighted
> score of distance (closer is better), offered rate (higher is better), and pickup
> availability (available is better)."

Test it by calling the endpoint with sample coordinates from your seed data.

---

## STEP 6: Seed Realistic Mock Data

Prompt your AI assistant:

> "Generate a SQL INSERT script with realistic seed data for: 10 recyclers around
> [your city], with realistic names, locations, and offered rates for PCB (₹150-200/kg),
> cables (₹40-60/kg), batteries (₹80-120/kg), CRT (₹10-20/kg), motors (₹100-150/kg),
> and mixed plastic (₹15-25/kg). Also generate 30 days of historical price data for
> each material category showing realistic day-to-day fluctuation."

Run this in the SQL Editor — now your app has believable data to demo against
immediately, without needing real recyclers signed up yet.

---

## STEP 7: Connect Your Next.js App to Supabase

Prompt your AI assistant:

> "Set up a Supabase client singleton for a Next.js app using @supabase/supabase-js,
> reading the URL and anon key from environment variables, and write example functions
> for: creating a new lot, fetching nearby recyclers via the match-recyclers API,
> updating a lot's status, and subscribing to realtime updates on the lots table so
> the collector sees status changes live."

```bash
npm install @supabase/supabase-js
```

---

## STEP 8: Add Realtime (Nice Touch, Free, Already Included)

Supabase Realtime is included free. Prompt:

> "Add a Supabase Realtime subscription so that when a recycler accepts or updates a
> lot's status in the database, the collector's app updates the UI live without a
> page refresh."

This makes your demo feel polished — collector creates a lot, recycler accepts it on
another screen, and the collector's status updates instantly.

---

## STEP 9: Document Data Sourcing (Required by the PS)

Write a short markdown note (for Person 6's pitch) covering:
- Where your seed/mock price data assumptions came from (e.g. approximate ranges from
  public e-waste/CPCB reports)
- That real production data would come from live transactions once collectors and
  recyclers use the platform
- Any limitations (e.g. mock data doesn't reflect real regional price variation yet)

This satisfies the PS's explicit ask to "identify the source, quality, size, and
limitations" of your datasets.

---

## STEP 10: Test Everything Before Handing Off to Frontend Team

Checklist before Person 1/2 start wiring up UI:
- [ ] All 7 tables created and visible in Supabase Table Editor
- [ ] RLS policies tested (try querying as an anonymous user vs authenticated user)
- [ ] Auth flow works end-to-end (sign up → sign in → session persists)
- [ ] Matching API returns sensible ranked results for test coordinates
- [ ] Seed data looks realistic when viewed in Table Editor
- [ ] Realtime subscription fires correctly when a row updates

---

## Quick Reference: Every AI Prompt Used Above (copy-paste ready)

1. Schema generation prompt (Step 2)
2. RLS policy generation prompt (Step 3)
3. Magic link auth component prompt (Step 4)
4. Matching API prompt (Step 5)
5. Seed data prompt (Step 6)
6. Supabase client setup prompt (Step 7)
7. Realtime subscription prompt (Step 8)

Just paste each into your AI coding assistant in order, review/run the output, and fix
errors by pasting them back to the assistant — this is the fastest free path from zero
to a working backend.
