import { useNavigate, useParams } from 'react-router-dom';
import type { BoardData } from '../api/board';
import {
  phasesSorted,
  progressOf,
  sprintsForPhase,
  ticketsForSprint,
} from '../lib/board-utils';
import { ProgressBar } from '../components/common';

export function PhasesList({ board }: { board: BoardData }) {
  const navigate = useNavigate();
  const phases = phasesSorted(board);
  return (
    <div className="grid">
      {phases.map((p) => {
        const sprints = sprintsForPhase(board, p.id);
        const tickets = sprints.flatMap((s) => ticketsForSprint(board, s.id));
        return (
          <div key={p.id} className="tile" onClick={() => navigate(`/phase/${p.id}`)}>
            <h4>{p.name}</h4>
            <p>{p.goal}</p>
            <div className="tile-foot">
              <ProgressBar progress={progressOf(tickets)} />
            </div>
            <div className="tile-foot">
              <span>{sprints.length} weeks</span>
              <span>·</span>
              <span>{tickets.length} tickets</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PhaseDetail({ board }: { board: BoardData }) {
  const { phaseId = '' } = useParams();
  const navigate = useNavigate();
  const phase = board.phases.find((p) => p.id === phaseId);
  if (!phase) return <div className="empty">Phase not found.</div>;

  const sprints = sprintsForPhase(board, phaseId);
  const allTickets = sprints.flatMap((s) => ticketsForSprint(board, s.id));

  return (
    <>
      <div className="note-block" style={{ marginBottom: 16 }}>
        <strong>Goal:</strong> {phase.goal}
      </div>
      <div className="section-head" style={{ marginBottom: 16 }}>
        <ProgressBar progress={progressOf(allTickets)} />
      </div>

      <div className="grid">
        {sprints.map((s) => {
          const tickets = ticketsForSprint(board, s.id);
          return (
            <div key={s.id} className="tile" onClick={() => navigate(`/week/${s.id}`)}>
              <h4>{s.title}</h4>
              <p>{s.goal || s.tracks}</p>
              <div className="tile-foot">
                <ProgressBar progress={progressOf(tickets)} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
