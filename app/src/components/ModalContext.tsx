import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { Day, Status, Ticket } from '../lib/types';
import type { Sprint } from '../lib/types';
import TicketModal from './TicketModal';

interface OpenOptions {
  ticket?: Ticket | null;
  defaultSprintId?: string;
  defaultStatus?: Status;
  defaultDay?: Day | null;
}

interface ModalCtx {
  open: (opts?: OpenOptions) => void;
}

const Ctx = createContext<ModalCtx | undefined>(undefined);

export function ModalProvider({ sprints, children }: { sprints: Sprint[]; children: ReactNode }) {
  const [state, setState] = useState<OpenOptions | null>(null);

  const open = useCallback((opts?: OpenOptions) => setState(opts ?? {}), []);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {state && (
        <TicketModal
          ticket={state.ticket}
          defaultSprintId={state.defaultSprintId}
          defaultStatus={state.defaultStatus}
          defaultDay={state.defaultDay}
          sprints={sprints}
          onClose={() => setState(null)}
        />
      )}
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTicketModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTicketModal must be used within ModalProvider');
  return ctx;
}
