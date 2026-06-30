import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { STATUSES, STATUS_META, type Status, type Ticket } from '../lib/types';
import { TicketCard } from './TicketCard';
import { useUpdateTicket } from '../hooks/useBoard';

function DraggableTicket({ ticket, onOpen }: { ticket: Ticket; onOpen: (t: Ticket) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: ticket.id });
  return (
    <div
      ref={setNodeRef}
      className={isDragging ? 'dragging' : ''}
      {...attributes}
      {...listeners}
    >
      <TicketCard ticket={ticket} onClick={() => onOpen(ticket)} />
    </div>
  );
}

function Column({
  status,
  tickets,
  onOpen,
  onAdd,
}: {
  status: Status;
  tickets: Ticket[];
  onOpen: (t: Ticket) => void;
  onAdd: (s: Status) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = STATUS_META[status];
  return (
    <div ref={setNodeRef} className={`column${isOver ? ' drop-over' : ''}`}>
      <div className="column-head">
        <span className="dot" style={{ background: meta.color }} />
        <span className="title">{meta.label}</span>
        <span className="count">{tickets.length}</span>
      </div>
      <div className="column-body">
        {tickets.map((t) => (
          <DraggableTicket key={t.id} ticket={t} onOpen={onOpen} />
        ))}
      </div>
      <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => onAdd(status)}>
        + Add
      </button>
    </div>
  );
}

interface Props {
  tickets: Ticket[];
  onOpen: (t: Ticket) => void;
  onAdd: (status: Status) => void;
}

export default function Board({ tickets, onOpen, onAdd }: Props) {
  const update = useUpdateTicket();
  const [active, setActive] = useState<Ticket | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 6 } }),
  );

  const onDragStart = (e: DragStartEvent) => {
    setActive(tickets.find((t) => t.id === e.active.id) ?? null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    const overId = e.over?.id as Status | undefined;
    if (!overId) return;
    const ticket = tickets.find((t) => t.id === e.active.id);
    if (ticket && ticket.status !== overId && STATUSES.includes(overId)) {
      update.mutate({ id: ticket.id, patch: { status: overId } });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <div className="board">
        {STATUSES.map((s) => (
          <Column
            key={s}
            status={s}
            tickets={tickets.filter((t) => t.status === s)}
            onOpen={onOpen}
            onAdd={onAdd}
          />
        ))}
      </div>
      <DragOverlay>{active ? <TicketCard ticket={active} /> : null}</DragOverlay>
    </DndContext>
  );
}
