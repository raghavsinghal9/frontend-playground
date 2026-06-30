import { useMemo, useState } from 'react';
import type { BoardData } from '../api/board';
import {
  applyFilters,
  EMPTY_FILTERS,
  phasesSorted,
  sprintsForPhase,
  ticketsForSprint,
  type Filters,
} from '../lib/board-utils';
import { FiltersBar } from '../components/common';
import Board from '../components/Board';
import { useTicketModal } from '../components/ModalContext';
import type { Status } from '../lib/types';

export default function BoardView({ board }: { board: BoardData }) {
  const { open } = useTicketModal();
  const phases = phasesSorted(board);
  const firstSprint = sprintsForPhase(board, phases[0]?.id ?? '')[0];
  const [sprintId, setSprintId] = useState<string>(firstSprint?.id ?? '');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const tickets = useMemo(
    () => applyFilters(ticketsForSprint(board, sprintId), filters),
    [board, sprintId, filters],
  );

  return (
    <>
      <div className="filters">
        <select
          className="select"
          style={{ width: 'auto', fontWeight: 700 }}
          value={sprintId}
          onChange={(e) => setSprintId(e.target.value)}
        >
          {phases.map((p) => (
            <optgroup key={p.id} label={p.short}>
              {sprintsForPhase(board, p.id).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button
          className="btn btn-primary"
          onClick={() => open({ defaultSprintId: sprintId, defaultStatus: 'todo' })}
        >
          + New ticket
        </button>
      </div>

      <FiltersBar filters={filters} setFilters={setFilters} />

      <Board
        tickets={tickets}
        onOpen={(t) => open({ ticket: t })}
        onAdd={(status: Status) => open({ defaultSprintId: sprintId, defaultStatus: status })}
      />
    </>
  );
}
