import type { BoardData } from '../api/board';
import type { Phase, Sprint, Status, Ticket } from './types';
import { DAYS } from './types';

export interface Filters {
  search: string;
  track: string; // '' = all
  priority: string; // '' = all
  day: string; // '' = all
}

export const EMPTY_FILTERS: Filters = { search: '', track: '', priority: '', day: '' };

export function applyFilters(tickets: Ticket[], f: Filters): Ticket[] {
  const q = f.search.trim().toLowerCase();
  return tickets.filter((t) => {
    if (f.track && t.track !== f.track) return false;
    if (f.priority && t.priority !== f.priority) return false;
    if (f.day && t.day !== f.day) return false;
    if (q) {
      const hay = `${t.title} ${t.description} ${t.notes}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function sprintsForPhase(board: BoardData, phaseId: string): Sprint[] {
  return board.sprints
    .filter((s) => s.phase_id === phaseId)
    .sort((a, b) => a.position - b.position);
}

export function ticketsForSprint(board: BoardData, sprintId: string): Ticket[] {
  return board.tickets
    .filter((t) => t.sprint_id === sprintId)
    .sort((a, b) => a.position - b.position);
}

export function phasesSorted(board: BoardData): Phase[] {
  return [...board.phases].sort((a, b) => a.position - b.position);
}

export function sprintsSorted(board: BoardData): Sprint[] {
  return [...board.sprints].sort((a, b) => a.position - b.position);
}

export interface Progress {
  total: number;
  done: number;
  pct: number;
}

export function progressOf(tickets: Ticket[]): Progress {
  const total = tickets.length;
  const done = tickets.filter((t) => t.status === 'done').length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function statusCounts(tickets: Ticket[]): Record<Status, number> {
  const base: Record<Status, number> = {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
  };
  for (const t of tickets) base[t.status] = (base[t.status] ?? 0) + 1;
  return base;
}

// Group tickets by weekday in fixed Mon..Sun order; null-day tickets bucket under "Unscheduled".
export function groupByDay(tickets: Ticket[]): { day: string; tickets: Ticket[] }[] {
  const groups: { day: string; tickets: Ticket[] }[] = [];
  for (const day of DAYS) {
    const dayTickets = tickets.filter((t) => t.day === day);
    if (dayTickets.length) groups.push({ day, tickets: dayTickets });
  }
  const unscheduled = tickets.filter((t) => !t.day);
  if (unscheduled.length) groups.push({ day: 'Unscheduled', tickets: unscheduled });
  return groups;
}
