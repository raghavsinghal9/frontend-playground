import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { BoardData } from '../api/board';
import {
  applyFilters,
  EMPTY_FILTERS,
  groupByDay,
  phasesSorted,
  progressOf,
  sprintsForPhase,
  ticketsForSprint,
  type Filters,
} from '../lib/board-utils';
import { FiltersBar, ProgressBar, RowTicket } from '../components/common';
import { useTicketModal } from '../components/ModalContext';

// List of all weeks (sprints) grouped by phase.
export function WeeksList({ board }: { board: BoardData }) {
  const navigate = useNavigate();
  const phases = phasesSorted(board);
  return (
    <>
      {phases.map((p) => (
        <div key={p.id} className="section">
          <div className="section-head">
            <h3>{p.short}</h3>
            <span className="muted">{p.name}</span>
          </div>
          <div className="grid">
            {sprintsForPhase(board, p.id).map((s) => {
              const prog = progressOf(ticketsForSprint(board, s.id));
              return (
                <div key={s.id} className="tile" onClick={() => navigate(`/week/${s.id}`)}>
                  <h4>{s.title}</h4>
                  <p>{s.goal || s.tracks}</p>
                  <div className="tile-foot">
                    <ProgressBar progress={prog} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

// Single week (sprint) detail, tickets grouped by day.
export function WeekDetail({ board }: { board: BoardData }) {
  const { sprintId = '' } = useParams();
  const { open } = useTicketModal();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const sprint = board.sprints.find((s) => s.id === sprintId);
  const tickets = useMemo(
    () => applyFilters(ticketsForSprint(board, sprintId), filters),
    [board, sprintId, filters],
  );
  const groups = groupByDay(tickets);

  if (!sprint) return <div className="empty">Week not found.</div>;

  return (
    <>
      <div className="section-head" style={{ marginBottom: 14 }}>
        <ProgressBar progress={progressOf(ticketsForSprint(board, sprintId))} />
        <button
          className="btn btn-primary"
          onClick={() => open({ defaultSprintId: sprintId })}
        >
          + New ticket
        </button>
      </div>
      {sprint.tracks && (
        <div className="note-block" style={{ marginBottom: 16 }}>
          <strong>Tracks:</strong> {sprint.tracks}
        </div>
      )}

      <FiltersBar filters={filters} setFilters={setFilters} />

      {groups.length === 0 && (
        <div className="empty">
          <div className="big">🗓️</div>
          No tickets match your filters.
        </div>
      )}

      {groups.map((g) => (
        <div key={g.day} className="section">
          <div className="section-head">
            <h3>{g.day}</h3>
            <span className="muted">{g.tickets.length} tickets</span>
          </div>
          {g.tickets.map((t) => (
            <RowTicket key={t.id} ticket={t} onOpen={() => open({ ticket: t })} />
          ))}
        </div>
      ))}
    </>
  );
}
