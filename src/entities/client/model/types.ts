import type { Timestamp } from 'firebase/firestore';

export type ClientStatus = 'active' | 'inactive';

export type Client = {
  id: string;
  name: string;
  ceoName?: string;
  ceoContact?: string;
  address?: string;
  managerName?: string;
  managerContact?: string;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type ClientInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;

export type ClientDoc = Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
