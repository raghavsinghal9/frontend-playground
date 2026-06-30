-- ============================================================
-- Prep Tracker — Supabase schema
-- Run this in your Supabase project: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run (idempotent).
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.phases (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  key         text not null,
  name        text not null,
  short       text not null default '',
  goal        text not null default '',
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.sprints (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  phase_id    uuid not null references public.phases (id) on delete cascade,
  key         text not null,
  week_number int  not null,
  title       text not null,
  goal        text not null default '',
  tracks      text not null default '',
  start_date  date,
  end_date    date,
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  sprint_id   uuid not null references public.sprints (id) on delete cascade,
  title       text not null,
  description text not null default '',
  notes       text not null default '',
  track       text not null default 'DSA',
  day         text,
  status      text not null default 'todo',
  priority    text not null default 'medium',
  position    int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- Indexes ----------

create index if not exists phases_user_idx  on public.phases (user_id);
create index if not exists sprints_user_idx on public.sprints (user_id);
create index if not exists sprints_phase_idx on public.sprints (phase_id);
create index if not exists tickets_user_idx  on public.tickets (user_id);
create index if not exists tickets_sprint_idx on public.tickets (sprint_id);

-- ---------- updated_at trigger ----------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tickets_set_updated_at on public.tickets;
create trigger tickets_set_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------
-- Every user can only read/write their own rows.

alter table public.phases  enable row level security;
alter table public.sprints enable row level security;
alter table public.tickets enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['phases', 'sprints', 'tickets'] loop
    execute format('drop policy if exists %I_select on public.%I', t, t);
    execute format('drop policy if exists %I_insert on public.%I', t, t);
    execute format('drop policy if exists %I_update on public.%I', t, t);
    execute format('drop policy if exists %I_delete on public.%I', t, t);

    execute format(
      'create policy %I_select on public.%I for select using (auth.uid() = user_id)', t, t);
    execute format(
      'create policy %I_insert on public.%I for insert with check (auth.uid() = user_id)', t, t);
    execute format(
      'create policy %I_update on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t, t);
    execute format(
      'create policy %I_delete on public.%I for delete using (auth.uid() = user_id)', t, t);
  end loop;
end $$;
