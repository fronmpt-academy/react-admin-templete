import type { Transaction } from '@entities/transaction';

import { utils, writeFile } from 'xlsx';

import { dayjs } from '@shared/lib/date';

const HEADERS = ['거래일시', '거래처명', '거래항목', '거래금액', '상태', '등록일시'];

const STATUS_LABEL: Record<Transaction['status'], string> = {
  pending: '진행중',
  completed: '완료',
  cancelled: '취소',
};

export const exportTransactionsToXlsx = (items: Transaction[]) => {
  const rows = items.map((t) => [
    dayjs(t.date).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm'),
    t.clientName,
    t.items,
    t.amount,
    STATUS_LABEL[t.status],
    dayjs(t.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm'),
  ]);

  const ws = utils.aoa_to_sheet([HEADERS, ...rows]);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, '거래');
  writeFile(wb, `거래_${dayjs().tz('Asia/Seoul').format('YYYY-MM-DD')}.xlsx`);
};
