import type { Timestamp } from 'firebase/firestore';

import { dayjs } from './dayjs';

export const formatDateTime = (value: Date | Timestamp | null | undefined) => {
  if (!value) return '';
  const date = value instanceof Date ? value : value.toDate();
  return dayjs(date).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm');
};

export const formatDate = (value: Date | Timestamp | null | undefined) => {
  if (!value) return '';
  const date = value instanceof Date ? value : value.toDate();
  return dayjs(date).tz('Asia/Seoul').format('YYYY-MM-DD');
};

export const formatCurrencyKRW = (amount: number) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
