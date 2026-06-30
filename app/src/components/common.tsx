import {
  DAYS,
  PRIORITIES,
  PRIORITY_META,
  STATUS_META,
  TRACK_COLOR,
  TRACKS,
  type Priority,
  type Status,
  type Ticket,
} from '../lib/types';
import type { Progress } from '../lib/board-utils';
import type { Filters } from '../lib/board-utils';
import { useUpdateTicket } from '../hooks/useBoard';

export function ProgressBar({ progress }: { progress: Progress }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
      <div className="progress" aria-label={`${progress.pct}% complete`}>
        <span style={{ width: `${progress.pct}%` }} />
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
        {progress.done}/{progress.total}
      </span>
    </div>
  );
}

const STATUS_ORDER: Status[] = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];

// A row in the by-day / by-week lists. Clicking the circle cycles status;
// clicking the body opens the ticket.
export function RowTicket({ ticket, onOpen }: { ticket: Ticket; onOpen: () => void }) {
  const update = useUpdateTicket();
  const trackColor = TRACK_COLOR[ticket.track] ?? 'var(--blue)';
  const done = ticket.status === 'done';

  const cycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle straight to/from done for the quick checkbox.
    update.mutate({ id: ticket.id, patch: { status: done ? 'todo' : 'done' } });
  };

  return (
    <div className="row-card" onClick={onOpen}>
      <div className={`check${done ? ' done' : ''}`} onClick={cycle} title="Toggle done">
        {done ? '✓' : ''}
      </div>
      <div className="rc-main">
        <div className={`rc-title${done ? ' done' : ''}`}>{ticket.title}</div>
        <div className="rc-sub">
          <span style={{ color: trackColor, fontWeight: 700 }}>{ticket.track}</span>
          {ticket.day && <span>· {ticket.day}</span>}
          <span>· {STATUS_META[ticket.status].label}</span>
          {ticket.notes?.trim() && <span style={{ color: 'var(--blue)' }}>· ✎ notes</span>}
        </div>
      </div>
      <span
        className="dot"
        style={{ background: STATUS_META[ticket.status].color, width: 10, height: 10 }}
        title={STATUS_META[ticket.status].label}
      />
    </div>
  );
}

void STATUS_ORDER;

export function FiltersBar({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  return (
    <div className="filters">
      <div className="search">
        <span className="ico">⌕</span>
        <input
          className="input"
          placeholder="Search tickets…"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>
      <select
        className="select"
        style={{ width: 'auto' }}
        value={filters.track}
        onChange={(e) => setFilters({ ...filters, track: e.target.value })}
      >
        <option value="">All tracks</option>
        {TRACKS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        className="select"
        style={{ width: 'auto' }}
        value={filters.priority}
        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
      >
        <option value="">Any priority</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_META[p as Priority].label}
          </option>
        ))}
      </select>
      <select
        className="select"
        style={{ width: 'auto' }}
        value={filters.day}
        onChange={(e) => setFilters({ ...filters, day: e.target.value })}
      >
        <option value="">Any day</option>
        {DAYS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}
