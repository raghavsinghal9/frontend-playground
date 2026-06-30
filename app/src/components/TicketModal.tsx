import { useEffect, useState } from 'react';
import {
  DAYS,
  PRIORITIES,
  PRIORITY_META,
  STATUSES,
  STATUS_META,
  TRACKS,
  TRACK_COLOR,
  type Day,
  type Priority,
  type Status,
  type Ticket,
} from '../lib/types';
import type { Sprint } from '../lib/types';
import { useCreateTicket, useDeleteTicket, useUpdateTicket } from '../hooks/useBoard';

interface Props {
  ticket?: Ticket | null; // editing existing
  defaultSprintId?: string;
  defaultStatus?: Status;
  defaultDay?: Day | null;
  sprints: Sprint[];
  onClose: () => void;
}

export default function TicketModal({
  ticket,
  defaultSprintId,
  defaultStatus,
  defaultDay,
  sprints,
  onClose,
}: Props) {
  const isEdit = Boolean(ticket);
  const create = useCreateTicket();
  const update = useUpdateTicket();
  const remove = useDeleteTicket();

  const firstSprint = sprints[0]?.id ?? '';
  const [sprintId, setSprintId] = useState(ticket?.sprint_id ?? defaultSprintId ?? firstSprint);
  const [title, setTitle] = useState(ticket?.title ?? '');
  const [description, setDescription] = useState(ticket?.description ?? '');
  const [notes, setNotes] = useState(ticket?.notes ?? '');
  const [track, setTrack] = useState<string>(ticket?.track ?? 'DSA');
  const [day, setDay] = useState<string>(ticket?.day ?? defaultDay ?? '');
  const [status, setStatus] = useState<Status>(ticket?.status ?? defaultStatus ?? 'todo');
  const [priority, setPriority] = useState<Priority>(ticket?.priority ?? 'medium');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      if (isEdit && ticket) {
        await update.mutateAsync({
          id: ticket.id,
          patch: {
            sprint_id: sprintId,
            title: title.trim(),
            description,
            notes,
            track,
            day: (day || null) as Day | null,
            status,
            priority,
          },
        });
      } else {
        await create.mutateAsync({
          sprint_id: sprintId,
          title: title.trim(),
          description,
          notes,
          track,
          day: day || null,
          status,
          priority,
        });
      }
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!ticket) return;
    if (!confirm('Delete this ticket? This cannot be undone.')) return;
    setBusy(true);
    try {
      await remove.mutateAsync(ticket.id);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <span
            className="dot"
            style={{ background: TRACK_COLOR[track] ?? 'var(--blue)', width: 12, height: 12 }}
          />
          <h3>{isEdit ? 'Edit ticket' : 'New ticket'}</h3>
          <button className="close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="field">
          <label>Title</label>
          <input
            className="input"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement debounce"
          />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this task involve?"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Sprint (week)</label>
            <select
              className="select"
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
            >
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Day</label>
            <select className="select" value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="">Unscheduled</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Track</label>
            <select className="select" value={track} onChange={(e) => setTrack(e.target.value)}>
              {TRACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Priority</label>
            <select
              className="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_META[p].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Status</label>
          <div className="segmented">
            {STATUSES.map((s) => (
              <button
                key={s}
                className={status === s ? 'active' : ''}
                onClick={() => setStatus(s)}
                type="button"
              >
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Notes</label>
          <textarea
            className="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Personal notes, links, learnings, blockers…"
          />
        </div>

        <div className="modal-actions">
          {isEdit && (
            <button className="btn btn-danger" onClick={onDelete} disabled={busy}>
              Delete
            </button>
          )}
          <span className="spacer" />
          <button className="btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={busy || !title.trim()}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
