# PROJECT CONTEXT — Kabadiwala Connect

*A knowledge file for anyone joining or reviewing this project — mentors, judges,
new teammates, or future contributors. Read this top to bottom to understand
everything about what we're building and why.*

---

## 1. What Competition Is This For?

**Smart India Hackathon (SIH) 2026**
Problem Statement ID: **SIH26229**
Title: *"Kabadiwala Connect – Bringing the Informal Collector into the Formal
Recycling Chain"*
Sponsoring Ministry: **Ministry of Mines (MoM)**
Theme: **Clean & Green Technology**
Category: **Software** (no hardware component required or allowed)

---

## 2. The Real-World Problem (in plain language)

India generates huge amounts of electronic waste (old phones, TVs, circuit boards,
batteries, cables). Most of it is actually collected not by big companies, but by
**informal scrap collectors** — the local kabadiwalas who go door to door.

The problem is these collectors are **completely outside the formal system**:
- They don't know the fair market price of what they're carrying
- They don't know which recyclers are officially authorized under India's
  E-Waste (Management) Rules, 2022
- They have no documented, traceable record of what they sold or to whom
- Because of this, their material often ends up processed unsafely (open-air
  cable burning, acid stripping of circuit boards) — which is dangerous for
  the workers and wastes valuable materials like lithium, cobalt, gold, and
  rare earth elements that could otherwise be properly recovered

**In short:** the gap isn't really technological — it's *informational and
institutional*. Collectors don't have the information or incentive to go through
the proper channel, so they don't.

---

## 3. What We're Building (the solution, in plain language)

**Kabadiwala Connect** — an app that gives informal scrap collectors:
1. **Instant, fair pricing** — take a photo of what you collected, get an
   immediate value estimate
2. **A path to authorized recyclers** — see the nearest legitimate recycler who
   wants that material, ranked by distance/price/pickup availability
3. **Proof of every transaction** — a digital, GPS-and-timestamp-verified
   handover record, so there's a real paper trail
4. **A running earnings record** — like a digital passbook of what they've
   earned over time
5. **Safety knowledge** — simple pictorial/audio guidance on what NOT to do
   (like burning cables or cracking open batteries unsafely)

All of this works in **Hindi and Marathi**, is designed for people with
**limited literacy**, and — critically — works **even with no internet
connection**, since that's the real-world reality for many collectors.

---

## 4. Exact Requirements From the Official Problem Statement

These are non-negotiable — every one of these must be addressed in the final
solution, because they're explicitly stated in the PS and will be checked by
judges.

**Core features required:**
- Photograph + categorize + create digital "lots" of collected material
  (materials named: CRTs, LCD panels, PCBs, cables, batteries, motors/magnet
  assemblies, mixed plastics)
- Enter approximate weight → instant value estimate
- Price discovery with historical price data and basic trend visibility
- Traceable material + transaction dataset (from collection to formal recycling)
- Authorized recycler database, used to rank/match suitable recyclers
- AI/ML features "wherever sufficient training data is available":
  material classification, approximate valuation, recycler matching, and
  detection of abnormal/inconsistent transaction values
- Simple price board with **spoken price information**
- Matching logic based on location, material category, offered rate, pickup
  availability, and authorization status
- Digital, verifiable handover record: photos + weight + timestamp + GPS +
  unique reference confirmable by the recycler
- Easy-to-understand earnings ledger
- Pictorial/audio safety guidance on hazardous practices
- **Hindi and Marathi minimum**, genuinely usable for limited-literacy users
- **Offline-first architecture** — core actions must work with no connectivity,
  sync when connection returns
- Must run on **entry-level Android devices**, small app size, low memory use
- **Cash transactions must work** — digital payment must stay optional, never
  a requirement

**Six required datasets** (explicitly named in the PS):
1. Material Dataset
2. Price Dataset
3. Recycler Dataset
4. Transaction Dataset
5. Traceability Dataset
6. Collector Dataset (minimal profile only — avoid unnecessary personal data)

Plus an **AI/ML Training Dataset** wherever AI/ML is used, with source, quality,
size, and limitations clearly documented.

**Expected final deliverables** (per the PS's "Expected Outcome" section):
- A working mobile application
- A recycler-side interface
- The structured datasets listed above, shown as dynamically generated/used —
  not static dummy data
- **Field research involving at least 2 real scrap collectors or aggregators**
- A live usability demonstration
- A short **unit-economics assessment** comparing a collector's current earnings
  to potential earnings through the platform, and how the platform sustains
  itself financially

---

## 5. Our Technical Approach (final decisions)

| Decision | What we chose | Why |
|---|---|---|
| Build order | **Web app first**, then wrap into an installable `.apk` | Fastest free path to a real app without learning a new native framework mid-hackathon |
| App type (final) | Progressive Web App wrapped via **Capacitor** into a native Android `.apk` | Free, reuses the same codebase, satisfies "mobile application" requirement literally |
| Frontend | Next.js + Tailwind CSS | Fast to build, free, pairs well with AI coding assistants |
| Backend/DB/Auth | **Supabase** (free tier) | Free Postgres + Auth + Storage + Realtime, no card required |
| AI/ML | **Own lightweight model**, trained free via **Teachable Machine**, exported to **TensorFlow.js**, runs fully on-device | Satisfies "AI/ML material classification" requirement AND the offline requirement at the same time — no API calls needed at inference time |
| Offline strategy | Service worker + IndexedDB queue + sync-on-reconnect | Directly satisfies the PS's offline-first requirement |
| Voice | Web Speech API (built into Android's WebView/Chrome) | Free, works offline once page is loaded, satisfies "spoken price information" |
| Maps | OpenStreetMap + Leaflet.js | Free, no billing account required (unlike Google Maps) |
| Auth | Magic link (collectors don't need SMS OTP, which costs money) / email-password for recyclers | Keeps cost at ₹0 |
| Total budget | **₹0** | Every tool used has a genuinely sufficient free tier |

---

## 6. System Architecture (high level)

```
Collector App (Next.js PWA, wrapped in Capacitor → .apk)
   ↕
Supabase (Postgres + Auth + Storage + Realtime)
   ↕
Recycler Dashboard (Next.js, web-based)

On-device: TensorFlow.js model (material classification, offline)
On-device: Service Worker + IndexedDB (offline queue, syncs when online)
```

---

## 7. The Six Datasets (exact fields, matches the PS verbatim)

- **Materials**: category, sub-category, description, image, weight, condition, source type, estimated value
- **Prices**: material category, location, date/time, buying price, quoted price, unit, recycler, historical price data
- **Recyclers**: name, location, materials accepted, authorization status/details, contact, offered rate, pickup availability, service area
- **Transactions**: lot ID, collector ID, category, weight, quoted price, final price, recycler ID, locations, date/time, payment status, transaction status
- **Traceability**: lot ID, photos, weight, timestamp, GPS, handover reference number, recycler confirmation, status
- **Collectors**: minimal profile — ID, preferred language, general location, transaction history, earnings history (no unnecessary personal data, per PS instruction)

---

## 8. Team Structure (6 people)

| # | Role | Responsibility |
|---|---|---|
| 1 | Frontend – Collector App | Onboarding, lot creation, price board, earnings ledger, safety guidance |
| 2 | Frontend – Recycler App | Recycler login/profile, lot handling, handover confirmation |
| 3 | Backend/Database | All 6 datasets in Supabase, matching/ranking API, seed data |
| 4 | AI/ML | Model training (Teachable Machine → TF.js), valuation logic, anomaly detection, voice |
| 5 | Offline + APK | Service worker, offline sync, Capacitor build pipeline, device testing |
| 6 | Research/Pitch | Field research (2 real collectors), unit economics, dataset narrative, demo/pitch |

---

## 9. Why This Problem Statement Was Chosen

- **High real-world social + environmental impact** — improves livelihoods of
  some of the most economically vulnerable workers in India's informal economy,
  while reducing toxic e-waste processing and strengthening India's formal
  EPR/recycling system
- **Low competition** — most hackathon teams gravitate to generic AI chatbots
  or crop-disease detection; this angle (informal e-waste collectors) is far
  less commonly picked, making it easier to stand out
- **Fully buildable in a hackathon timeframe** — no hardware, no drones, no
  research-grade NLP for under-resourced languages — every required feature
  maps cleanly to well-understood, AI-assistable web/mobile development
  patterns
- **Genuinely satisfies "offline-first"** — because the AI model itself runs
  on-device rather than calling an API, the whole solution is honestly
  offline-capable, not just offline in name

---

## 10. Demo Strategy (the moment that proves everything)

The strongest possible demo sequence: put the phone in **airplane mode**,
create a lot (photograph material → AI classifies it → get price estimate),
complete a handover (photo + GPS + timestamp recorded locally) — all with zero
internet — then reconnect and show the data sync to Supabase automatically.
This single ~60-second sequence proves the offline-first requirement, the
on-device AI requirement, and the traceability requirement all at once.

---

## 11. Related Reference Documents (already produced for this project)

- `final-master-document.md` — full feature breakdown by frontend/backend/AI/offline
- `final-apk-plan.md` — step-by-step build guide from web app to installable `.apk`
- `free-ml-model-training-guide.md` — full free pipeline to train the on-device AI model
- `backend-db-auth-guide.md` — step-by-step Supabase backend/DB/auth setup
- `final-work-division.md` — task-by-task mapping of every PS requirement to a team member
