import type { Timestamp as TS } from 'firebase/firestore';

import {
  doc,
  query,
  addDoc,
  getDocs,
  orderBy,
  deleteDoc,
  Timestamp,
  updateDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { firestore } from '@shared/api/firebase';

import type { Transaction, TransactionDoc, TransactionInput } from '../model/types';

const colPath = (uid: string) => collection(firestore, 'users', uid, 'transactions');

const toTransaction = (id: string, data: TransactionDoc): Transaction => ({
  id,
  ...data,
  date: data.date.toDate(),
  createdAt: data.createdAt.toDate(),
  updatedAt: data.updatedAt.toDate(),
});

export const listTransactions = async (uid: string): Promise<Transaction[]> => {
  const snap = await getDocs(query(colPath(uid), orderBy('date', 'desc')));
  return snap.docs.map((d) => toTransaction(d.id, d.data() as TransactionDoc));
};

export const createTransaction = async (
  uid: string,
  input: TransactionInput
): Promise<string> => {
  const ref = await addDoc(colPath(uid), {
    ...input,
    date: Timestamp.fromDate(input.date),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateTransaction = async (
  uid: string,
  id: string,
  input: TransactionInput
): Promise<void> => {
  await updateDoc(doc(firestore, 'users', uid, 'transactions', id), {
    ...input,
    date: Timestamp.fromDate(input.date),
    updatedAt: serverTimestamp() as unknown as TS,
  });
};

export const deleteTransaction = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(firestore, 'users', uid, 'transactions', id));
};
