import { supabase } from '../lib/supabase';
import type { Phase, Sprint, Ticket } from '../lib/types';
import { SEED_PHASES } from '../data/seed';

export interface BoardData {
  phases: Phase[];
  sprints: Sprint[];
  tickets: Ticket[];
}

// Fetch the entire board for the signed-in user in three queries.
export async function fetchBoard(userId: string): Promise<BoardData> {
  const [phasesRes, sprintsRes, ticketsRes] = await Promise.all([
    supabase.from('phases').select('*').eq('user_id', userId).order('position'),
    supabase.from('sprints').select('*').eq('user_id', userId).order('position'),
    supabase.from('tickets').select('*').eq('user_id', userId).order('position'),
  ]);

  if (phasesRes.error) throw phasesRes.error;
  if (sprintsRes.error) throw sprintsRes.error;
  if (ticketsRes.error) throw ticketsRes.error;

  return {
    phases: (phasesRes.data ?? []) as Phase[],
    sprints: (sprintsRes.data ?? []) as Sprint[],
    tickets: (ticketsRes.data ?? []) as Ticket[],
  };
}

// On first login the user has no phases — populate from the bundled seed.
export async function seedBoardIfEmpty(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('phases')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  if ((count ?? 0) > 0) return false;

  for (const phase of SEED_PHASES) {
    const { data: phaseRow, error: pErr } = await supabase
      .from('phases')
      .insert({
        user_id: userId,
        key: phase.key,
        name: phase.name,
        short: phase.short,
        goal: phase.goal,
        position: phase.order,
      })
      .select()
      .single();
    if (pErr) throw pErr;

    for (const sprint of phase.sprints) {
      const { data: sprintRow, error: sErr } = await supabase
        .from('sprints')
        .insert({
          user_id: userId,
          phase_id: phaseRow.id,
          key: sprint.key,
          week_number: sprint.weekNumber,
          title: sprint.title,
          goal: sprint.goal,
          tracks: sprint.tracks,
          position: sprint.order,
        })
        .select()
        .single();
      if (sErr) throw sErr;

      if (sprint.tickets.length) {
        const rows = sprint.tickets.map((t) => ({
          user_id: userId,
          sprint_id: sprintRow.id,
          title: t.title,
          description: t.description,
          notes: '',
          track: t.track,
          day: t.day,
          status: t.status,
          priority: t.priority,
          position: t.order,
        }));
        const { error: tErr } = await supabase.from('tickets').insert(rows);
        if (tErr) throw tErr;
      }
    }
  }
  return true;
}

// ---- Ticket CRUD ----

export interface NewTicketInput {
  sprint_id: string;
  title: string;
  description?: string;
  notes?: string;
  track?: string;
  day?: string | null;
  status?: string;
  priority?: string;
}

export async function createTicket(userId: string, input: NewTicketInput): Promise<Ticket> {
  // Place new ticket at the end of its sprint.
  const { data: maxRow } = await supabase
    .from('tickets')
    .select('position')
    .eq('sprint_id', input.sprint_id)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (maxRow?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      user_id: userId,
      sprint_id: input.sprint_id,
      title: input.title,
      description: input.description ?? '',
      notes: input.notes ?? '',
      track: input.track ?? 'DSA',
      day: input.day ?? null,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      position,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Ticket;
}

export async function updateTicket(id: string, patch: Partial<Ticket>): Promise<Ticket> {
  // Strip immutable / server-managed fields.
  const { id: _id, user_id: _u, created_at: _c, updated_at: _up, ...clean } = patch;
  void _id;
  void _u;
  void _c;
  void _up;
  const { data, error } = await supabase
    .from('tickets')
    .update(clean)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Ticket;
}

export async function deleteTicket(id: string): Promise<void> {
  const { error } = await supabase.from('tickets').delete().eq('id', id);
  if (error) throw error;
}

// ---- Sprint helpers ----

export async function updateSprint(id: string, patch: Partial<Sprint>): Promise<Sprint> {
  const { id: _id, user_id: _u, created_at: _c, ...clean } = patch;
  void _id;
  void _u;
  void _c;
  const { data, error } = await supabase
    .from('sprints')
    .update(clean)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Sprint;
}
