import type { Client } from '@entities/client';

import { utils, writeFile } from 'xlsx';

import { dayjs } from '@shared/lib/date';

const HEADERS = [
  '거래처명',
  '대표명',
  '대표 연락처',
  '주소',
  '담당자명',
  '담당자 연락처',
  '상태',
  '등록일시',
];

const STATUS_LABEL: Record<Client['status'], string> = {
  active: '활성',
  inactive: '비활성',
};

export const exportClientsToXlsx = (clients: Client[]) => {
  const rows = clients.map((c) => [
    c.name,
    c.ceoName ?? '',
    c.ceoContact ?? '',
    c.address ?? '',
    c.managerName ?? '',
    c.managerContact ?? '',
    STATUS_LABEL[c.status],
    dayjs(c.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm'),
  ]);

  const ws = utils.aoa_to_sheet([HEADERS, ...rows]);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, '거래처');
  writeFile(wb, `거래처_${dayjs().tz('Asia/Seoul').format('YYYY-MM-DD')}.xlsx`);
};
