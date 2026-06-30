import {
  PRIORITY_META,
  TRACK_COLOR,
  type Priority,
  type Ticket,
} from '../lib/types';

export function TicketCard({ ticket, onClick }: { ticket: Ticket; onClick?: () => void }) {
  const trackColor = TRACK_COLOR[ticket.track] ?? 'var(--blue)';
  const prio = PRIORITY_META[ticket.priority as Priority] ?? PRIORITY_META.medium;
  return (
    <div className="ticket" onClick={onClick}>
      <div className="ticket-top">
        <span className="pill" style={{ background: `${trackColor}1f`, color: trackColor }}>
          <span className="dot" style={{ background: trackColor }} />
          {ticket.track}
        </span>
      </div>
      <p className="ticket-title">{ticket.title}</p>
      <div className="ticket-meta">
        {ticket.day && <span>{ticket.day}</span>}
        <span className="spacer" />
        {ticket.notes?.trim() && <span className="notes-flag" title="Has notes">✎</span>}
        <span className="pill" style={{ background: `${prio.color}1f`, color: prio.color }}>
          {prio.label}
        </span>
      </div>
    </div>
  );
}
