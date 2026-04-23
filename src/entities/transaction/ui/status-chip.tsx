import { Chip } from '@shared/ui';

import type { TransactionStatus } from '../model/types';

const LABEL: Record<TransactionStatus, string> = {
  pending: '진행중',
  completed: '완료',
  cancelled: '취소',
};

const COLOR: Record<TransactionStatus, 'warning' | 'success' | 'default'> = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'default',
};

export function TransactionStatusChip({ status }: { status: TransactionStatus }) {
  return <Chip size="small" color={COLOR[status]} label={LABEL[status]} />;
}
