import { useNavigate } from 'react-router-dom';
import type { BoardData } from '../api/board';
import { phasesSorted, progressOf, sprintsForPhase, ticketsForSprint } from '../lib/board-utils';
import { ProgressBar } from '../components/common';

export default function Overview({ board }: { board: BoardData }) {
  const navigate = useNavigate();
  const all = board.tickets;
  const overall = progressOf(all);
  const phases = phasesSorted(board);

  const inProgress = all.filter((t) => t.status === 'in_progress').length;
  const remaining = all.length - overall.done;

  return (
    <>
      <div className="stat-row">
        <div className="stat">
          <div className="v">{overall.pct}%</div>
          <div className="l">Overall complete</div>
        </div>
        <div className="stat">
          <div className="v">{overall.done}</div>
          <div className="l">Tickets done</div>
        </div>
        <div className="stat">
          <div className="v">{inProgress}</div>
          <div className="l">In progress</div>
        </div>
        <div className="stat">
          <div className="v">{remaining}</div>
          <div className="l">Remaining</div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h3>Phases</h3>
          <span className="muted">3 phases · 12 weekly sprints</span>
        </div>
        <div className="grid">
          {phases.map((p) => {
            const sprints = sprintsForPhase(board, p.id);
            const phaseTickets = sprints.flatMap((s) => ticketsForSprint(board, s.id));
            const prog = progressOf(phaseTickets);
            return (
              <div key={p.id} className="tile" onClick={() => navigate(`/phase/${p.id}`)}>
                <h4>{p.name}</h4>
                <p>{p.goal}</p>
                <div className="tile-foot">
                  <ProgressBar progress={prog} />
                </div>
                <div className="tile-foot">
                  <span>{sprints.length} weeks</span>
                  <span>·</span>
                  <span>{phaseTickets.length} tickets</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
