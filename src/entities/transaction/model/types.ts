import type { Timestamp } from 'firebase/firestore';

export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export type Transaction = {
  id: string;
  clientId: string;
  clientName: string;
  date: Date;
  items: string;
  amount: number;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type TransactionInput = Omit<
  Transaction,
  'id' | 'createdAt' | 'updatedAt' | 'date'
> & {
  date: Date;
};

export type TransactionDoc = Omit<
  Transaction,
  'id' | 'date' | 'createdAt' | 'updatedAt'
> & {
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
