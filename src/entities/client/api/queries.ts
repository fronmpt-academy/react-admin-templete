import { useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthContext } from '@shared/router/components';

import { listClients, createClient, deleteClient, updateClient } from './repository';

import type { Client, ClientInput } from '../model/types';

export const clientsKey = (uid: string) => ['clients', uid] as const;

export function useClients() {
  const { user } = useContext(AuthContext);
  const uid = user?.uid;

  return useQuery<Client[]>({
    queryKey: uid ? clientsKey(uid) : ['clients', 'anon'],
    enabled: Boolean(uid),
    queryFn: () => {
      if (!uid) throw new Error('not authenticated');
      return listClients(uid);
    },
  });
}

export function useCreateClient() {
  const { user } = useContext(AuthContext);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientInput) => {
      if (!user) throw new Error('not authenticated');
      return createClient(user.uid, input);
    },
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: clientsKey(user.uid) });
    },
  });
}

export function useUpdateClient() {
  const { user } = useContext(AuthContext);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ClientInput }) => {
      if (!user) throw new Error('not authenticated');
      return updateClient(user.uid, id, input);
    },
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: clientsKey(user.uid) });
    },
  });
}

export function useDeleteClient() {
  const { user } = useContext(AuthContext);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error('not authenticated');
      return deleteClient(user.uid, id);
    },
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: clientsKey(user.uid) });
    },
  });
}
