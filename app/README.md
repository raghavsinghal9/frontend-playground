# Prep Tracker

A **Jira-style sprint board** for the 12-week frontend interview prep plan. Built as a
personal product: log in, track every task as a ticket, move it across statuses, add notes,
and watch your progress per **day**, per **week (sprint)**, and per **phase (epic)**.

- **iOS-style UI** — white/blue, glassmorphism, segmented controls, fully responsive (phone → desktop).
- **Auth + cloud sync** via Supabase (email/password). Your data follows you on any device.
- **Auto-seeded** from the prep-plan markdown — your board comes pre-loaded with all 12 weeks of tasks on first login.

## How the plan maps to Jira concepts

| Prep plan        | App concept | Count |
|------------------|-------------|-------|
| Phase            | Epic        | 3     |
| Week             | Sprint      | 12    |
| Daily task       | Ticket      | ~146  |
| DSA / JS / Machine Coding / System Design / Behavioral / Review | Track (label) | — |

**Statuses:** Backlog → To Do → In Progress → In Review → Done (drag-and-drop on the board).

**Views:** Overview (dashboard) · Board (Kanban per sprint) · Weeks (sprint list → per-day breakdown) · Phases (epic list → sprints).

---

## Tech stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Supabase](https://supabase.com/) — Postgres + Auth (with Row-Level Security)
- [TanStack Query](https://tanstack.com/query) — data fetching/caching with optimistic updates
- [@dnd-kit](https://dndkit.com/) — touch-friendly drag-and-drop

---

## Setup

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com/) → **New project** (free tier is fine).
2. Once it's ready, open **SQL Editor → New query**, paste the contents of
   [`../supabase/schema.sql`](../supabase/schema.sql), and **Run**. This creates the
   `phases`, `sprints`, `tickets` tables with Row-Level Security so each user only sees their own data.
3. (Optional) **Authentication → Providers → Email**: turn *Confirm email* off if you want
   instant sign-in without an email round-trip.

### 2. Configure the app
```bash
cd app
cp .env.example .env
```
Fill `.env` with your project's **URL** and **anon public key** (Supabase → Project Settings → API):
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Run locally
```bash
npm install
npm run dev
```
Open the printed URL, **register**, and your board auto-populates with all 12 weeks.

---

## Deploy to Vercel (custom domain)

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com/) → **Add New → Project** → import the repo.
3. Set **Root Directory** to `app`.
4. Add the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
   under **Settings → Environment Variables**.
5. Deploy. The included [`vercel.json`](./vercel.json) handles SPA routing rewrites.
6. **Settings → Domains** → add your custom domain and point your DNS as instructed.
7. Back in Supabase → **Authentication → URL Configuration**, add your domain to the
   **Site URL / Redirect URLs** so auth links resolve to your site.

---

## Regenerating seed data

The starting board is generated from the `week-*-deep-dive.md` files in the repo root:

```bash
npm run seed:gen   # writes app/src/data/seed.ts
```

Edit the markdown plan and re-run to refresh the seed (only affects *new* accounts;
existing boards keep their edits).

## Project structure

```
app/
  src/
    api/board.ts        # Supabase queries + first-login seeding
    auth/               # Supabase auth context
    components/         # Board, TicketCard, TicketModal, AuthPage, layout, shared UI
    hooks/useBoard.ts   # TanStack Query hooks (optimistic mutations)
    lib/                # types, supabase client, board utilities
    pages/              # Overview, Board, Weeks, Phases views
    data/seed.ts        # AUTO-GENERATED from the markdown plan
supabase/schema.sql     # DB schema + RLS policies
scripts/generate-seed.mjs
```
