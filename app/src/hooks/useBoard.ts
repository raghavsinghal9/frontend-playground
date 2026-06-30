import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTicket,
  deleteTicket,
  fetchBoard,
  seedBoardIfEmpty,
  updateSprint,
  updateTicket,
  type BoardData,
  type NewTicketInput,
} from '../api/board';
import { useAuth } from '../auth/AuthProvider';
import type { Sprint, Ticket } from '../lib/types';

const KEY = ['board'];

export function useBoard() {
  const { user } = useAuth();
  return useQuery<BoardData>({
    queryKey: [...KEY, user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      await seedBoardIfEmpty(user.id);
      return fetchBoard(user.id);
    },
  });
}

export function useCreateTicket() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewTicketInput) => {
      if (!user) throw new Error('Not authenticated');
      return createTicket(user.id, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateTicket() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Ticket> }) =>
      updateTicket(id, patch),
    // Optimistic update so drag-and-drop / status changes feel instant.
    onMutate: async ({ id, patch }) => {
      const queryKey = [...KEY, user?.id];
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<BoardData>(queryKey);
      if (prev) {
        qc.setQueryData<BoardData>(queryKey, {
          ...prev,
          tickets: prev.tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        });
      }
      return { prev, queryKey };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.queryKey, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTicket(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Sprint> }) =>
      updateSprint(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
