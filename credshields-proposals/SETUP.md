# CredShields Proposal System — Setup Guide
## Live in ~20 minutes. Everything is free.

---

## WHAT YOU'RE BUILDING

  /dashboard        → Sales team internal tool (password protected)
  /p/[unique-slug]  → Client proposal page (email gated)

Dashboard: create, edit, delete proposals — copy shareable links —
see view counts and captured emails — search — export CSV.

Proposal page: full branded proposal with client name and pricing
pre-filled, blurred behind an email gate, auto-unlocks on return visits.

---

## STEP 1 — GitHub (store the code)

1. Go to github.com and create a free account
2. Click + (top right) > New repository
3. Name it: credshields-proposals — set to Private — Create repository
4. On the next page click "uploading an existing file"
5. Drag and drop ALL files from this folder (keep the folder structure)
6. Click Commit changes

---

## STEP 2 — Supabase (your database)

1. Go to supabase.com and create a free account
2. Click New Project — name it credshields-proposals
3. Pick a region near you — Create new project — wait ~2 mins
4. In the left sidebar click SQL Editor
5. Click New Query — paste the SQL below — click Run

--- PASTE THIS SQL ---

create table proposals (
  id               uuid    default gen_random_uuid() primary key,
  slug             text    unique not null,
  client_name      text    not null,
  company          text    not null,
  original_price   integer not null default 7500,
  final_price      integer not null,
  loc              integer not null default 1798,
  days             integer not null default 6,
  scope_description text,
  created_at       timestamp with time zone default now(),
  updated_at       timestamp with time zone default now()
);

create table leads (
  id           uuid    default gen_random_uuid() primary key,
  proposal_id  uuid    references proposals(id),
  email        text    not null,
  viewed_at    timestamp with time zone default now()
);

create table views (
  id           uuid    default gen_random_uuid() primary key,
  proposal_id  uuid    references proposals(id),
  viewed_at    timestamp with time zone default now()
);

--- END SQL ---

6. You should see "Success. No rows returned"
7. Go to Project Settings (gear icon bottom-left) > API
8. Copy and save these 3 values:
   - Project URL        (looks like: https://xxxx.supabase.co)
   - anon public key    (under Project API Keys)
   - service_role key   (click Reveal — keep this secret)

---

## STEP 3 — Vercel (host the app)

1. Go to vercel.com — sign up with your GitHub account
2. Click Add New > Project
3. Find credshields-proposals — click Import
4. Leave all settings as-is — click Deploy
5. First deploy will likely fail — that's fine, env vars are missing

---

## STEP 4 — Add Environment Variables

1. In Vercel click Settings (top nav) > Environment Variables (left sidebar)
2. Add each of these 4 variables and click Save after each:

   NEXT_PUBLIC_SUPABASE_URL        = your Supabase Project URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY   = your anon public key
   SUPABASE_SERVICE_ROLE_KEY       = your service_role key
   DASHBOARD_PASSWORD              = a password for your team (e.g. cs-sales-2024!)

3. After all 4 are saved:
   Click Deployments (top nav) > 3 dots on latest deploy > Redeploy
   Wait ~1 minute — should succeed this time

---

## STEP 5 — YOU'RE LIVE

Your app is at: your-project-name.vercel.app

   /dashboard     = sales team login and proposal manager
   /p/[slug]      = client-facing gated proposal URL

---

## DAILY WORKFLOW

CREATE A PROPOSAL (2 mins)
1. Go to /dashboard — enter your team password
2. Click + New Proposal
3. Fill in client name, company, prices, LOC, days
4. Click Generate Proposal Link
5. Click the Link button to copy the URL
6. Send to client on Telegram/Discord

EDIT A PROPOSAL
1. Find it in the dashboard table
2. Click Edit
3. Change anything — click Save Changes
4. Same URL, content updates instantly

CHECK LEADS
1. Views column = total times page was opened
2. Click the Leads count to expand emails + timestamps
3. Click Export CSV to download for that proposal
4. Click Export All Leads in the header to get every email

---

## OPTIONAL: CUSTOM DOMAIN

To use proposals.credshields.com instead of your-app.vercel.app:
1. Vercel > Settings > Domains > add proposals.credshields.com
2. Add the CNAME record shown to your DNS provider
3. Takes 5-30 minutes

---

## TROUBLESHOOTING

"Error creating proposal"    = check Supabase env vars (copy-paste, no spaces)
Proposal page shows 404      = re-run the SQL in Supabase SQL Editor
Wrong password on dashboard  = check DASHBOARD_PASSWORD env var in Vercel
Changes not appearing        = trigger a fresh Redeploy in Vercel
"relation does not exist"    = SQL didn't run — go back to Step 2 Step 5

---

## FILE STRUCTURE

credshields-proposals/
  SETUP.md                        this file
  package.json
  next.config.mjs
  .env.example                    copy of env vars needed
  lib/supabase.js                 database client
  app/
    layout.jsx
    globals.css
    page.jsx                      redirects to /dashboard
    not-found.jsx                 404 page
    dashboard/page.jsx            sales team dashboard (CREATE+EDIT+LEADS)
    p/[slug]/
      page.jsx                    server: fetches proposal from DB
      ProposalClient.jsx          client: email gate + full proposal design
      loading.jsx                 loading spinner
    api/
      auth/route.js               password check
      proposals/route.js          GET all proposals / POST create
      proposals/[id]/route.js     PATCH edit / DELETE remove
      leads/route.js              POST save email
      views/route.js              POST track view
