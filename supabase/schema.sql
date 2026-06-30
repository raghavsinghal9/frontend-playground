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
  week_number int  not null check (week_number between 1 and 52),
  title       text not null check (char_length(title) <= 200),
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
  title       text not null check (char_length(title) between 1 and 300),
  description text not null default '' check (char_length(description) <= 20000),
  notes       text not null default '' check (char_length(notes) <= 50000),
  track       text not null default 'DSA' check (char_length(track) <= 60),
  day         text check (day in ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun')),
  status      text not null default 'todo'
              check (status in ('backlog', 'todo', 'in_progress', 'in_review', 'done')),
  priority    text not null default 'medium'
              check (priority in ('low', 'medium', 'high')),
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
  end loop;
end $$;

-- phases: a user only ever touches their own rows.
create policy phases_select on public.phases for select using (auth.uid() = user_id);
create policy phases_insert on public.phases for insert with check (auth.uid() = user_id);
create policy phases_update on public.phases for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy phases_delete on public.phases for delete using (auth.uid() = user_id);

-- sprints: own rows AND the referenced phase must also be theirs (no cross-user references).
create policy sprints_select on public.sprints for select using (auth.uid() = user_id);
create policy sprints_insert on public.sprints for insert with check (
  auth.uid() = user_id
  and exists (select 1 from public.phases p where p.id = phase_id and p.user_id = auth.uid())
);
create policy sprints_update on public.sprints for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.phases p where p.id = phase_id and p.user_id = auth.uid())
  );
create policy sprints_delete on public.sprints for delete using (auth.uid() = user_id);

-- tickets: own rows AND the referenced sprint must also be theirs.
create policy tickets_select on public.tickets for select using (auth.uid() = user_id);
create policy tickets_insert on public.tickets for insert with check (
  auth.uid() = user_id
  and exists (select 1 from public.sprints s where s.id = sprint_id and s.user_id = auth.uid())
);
create policy tickets_update on public.tickets for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.sprints s where s.id = sprint_id and s.user_id = auth.uid())
  );
create policy tickets_delete on public.tickets for delete using (auth.uid() = user_id);
