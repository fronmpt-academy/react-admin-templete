import { useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthContext } from '@shared/router/components';

import {
  listTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from './repository';

import type { Transaction, TransactionInput } from '../model/types';

export const transactionsKey = (uid: string) => ['transactions', uid] as const;

export function useTransactions() {
  const { user } = useContext(AuthContext);
  const uid = user?.uid;

  return useQuery<Transaction[]>({
    queryKey: uid ? transactionsKey(uid) : ['transactions', 'anon'],
    enabled: Boolean(uid),
    queryFn: () => {
      if (!uid) throw new Error('not authenticated');
      return listTransactions(uid);
    },
  });
}

export function useCreateTransaction() {
  const { user } = useContext(AuthContext);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInput) => {
      if (!user) throw new Error('not authenticated');
      return createTransaction(user.uid, input);
    },
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: transactionsKey(user.uid) });
    },
  });
}

export function useUpdateTransaction() {
  const { user } = useContext(AuthContext);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionInput }) => {
      if (!user) throw new Error('not authenticated');
      return updateTransaction(user.uid, id, input);
    },
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: transactionsKey(user.uid) });
    },
  });
}

export function useDeleteTransaction() {
  const { user } = useContext(AuthContext);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error('not authenticated');
      return deleteTransaction(user.uid, id);
    },
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: transactionsKey(user.uid) });
    },
  });
}
