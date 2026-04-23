import type { Timestamp } from 'firebase/firestore';

import {
  doc,
  query,
  addDoc,
  getDocs,
  orderBy,
  deleteDoc,
  updateDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { firestore } from '@shared/api/firebase';

import type { Client, ClientDoc, ClientInput } from '../model/types';

const colPath = (uid: string) => collection(firestore, 'users', uid, 'clients');

const toClient = (id: string, data: ClientDoc): Client => ({
  id,
  ...data,
  createdAt: data.createdAt.toDate(),
  updatedAt: data.updatedAt.toDate(),
});

export const listClients = async (uid: string): Promise<Client[]> => {
  const snap = await getDocs(query(colPath(uid), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => toClient(d.id, d.data() as ClientDoc));
};

export const createClient = async (uid: string, input: ClientInput): Promise<string> => {
  const ref = await addDoc(colPath(uid), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateClient = async (
  uid: string,
  id: string,
  input: ClientInput
): Promise<void> => {
  await updateDoc(doc(firestore, 'users', uid, 'clients', id), {
    ...input,
    updatedAt: serverTimestamp() as unknown as Timestamp,
  });
};

export const deleteClient = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(firestore, 'users', uid, 'clients', id));
};
