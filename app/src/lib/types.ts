// Domain types shared across the app.

export const STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done'] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_META: Record<Status, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: '#8e8e93' },
  todo: { label: 'To Do', color: '#0a84ff' },
  in_progress: { label: 'In Progress', color: '#ff9f0a' },
  in_review: { label: 'In Review', color: '#bf5af2' },
  done: { label: 'Done', color: '#30d158' },
};

export const TRACKS = [
  'DSA',
  'JavaScript',
  'Machine Coding',
  'System Design',
  'Behavioral',
  'Review',
] as const;
export type Track = (typeof TRACKS)[number] | string;

export const TRACK_COLOR: Record<string, string> = {
  DSA: '#0a84ff',
  JavaScript: '#ff9f0a',
  'Machine Coding': '#bf5af2',
  'System Design': '#30d158',
  Behavioral: '#ff375f',
  Review: '#8e8e93',
};

export const PRIORITIES = ['low', 'medium', 'high'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#8e8e93' },
  medium: { label: 'Medium', color: '#0a84ff' },
  high: { label: 'High', color: '#ff453a' },
};

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type Day = (typeof DAYS)[number];

// ---- Database row shapes (snake_case, mirrors Supabase tables) ----

export interface Phase {
  id: string;
  user_id: string;
  key: string;
  name: string;
  short: string;
  goal: string;
  position: number;
  created_at: string;
}

export interface Sprint {
  id: string;
  user_id: string;
  phase_id: string;
  key: string;
  week_number: number;
  title: string;
  goal: string;
  tracks: string;
  start_date: string | null;
  end_date: string | null;
  position: number;
  created_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  sprint_id: string;
  title: string;
  description: string;
  notes: string;
  track: Track;
  day: Day | null;
  status: Status;
  priority: Priority;
  position: number;
  created_at: string;
  updated_at: string;
}

// ---- Seed shapes (camelCase, produced by scripts/generate-seed.mjs) ----

export interface SeedTicket {
  key: string;
  title: string;
  description: string;
  track: string;
  day: Day;
  priority: Priority;
  status: Status;
  order: number;
}

export interface SeedSprint {
  key: string;
  weekNumber: number;
  title: string;
  goal: string;
  tracks: string;
  order: number;
  tickets: SeedTicket[];
}

export interface SeedPhase {
  key: string;
  name: string;
  short: string;
  goal: string;
  order: number;
  sprints: SeedSprint[];
}
