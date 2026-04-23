import type { Dayjs } from 'dayjs';
import type { TransactionStatus } from '@entities/transaction';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Box, MenuItem, TextField } from '@shared/ui';

export type TransactionFilterState = {
  search: string;
  status: 'all' | TransactionStatus;
  start: Dayjs | null;
  end: Dayjs | null;
};

type Props = {
  value: TransactionFilterState;
  onChange: (next: TransactionFilterState) => void;
};

export function TransactionFilters({ value, onChange }: Props) {
  const patch = (partial: Partial<TransactionFilterState>) =>
    onChange({ ...value, ...partial });

  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      <TextField
        label="거래처명 검색"
        value={value.search}
        onChange={(e) => patch({ search: e.target.value })}
        sx={{ minWidth: 220 }}
      />
      <DatePicker
        label="시작일"
        value={value.start}
        onChange={(v) => patch({ start: v })}
        slotProps={{ textField: { sx: { minWidth: 160 } } }}
      />
      <DatePicker
        label="종료일"
        value={value.end}
        onChange={(v) => patch({ end: v })}
        slotProps={{ textField: { sx: { minWidth: 160 } } }}
      />
      <TextField
        label="상태"
        select
        value={value.status}
        onChange={(e) => patch({ status: e.target.value as TransactionFilterState['status'] })}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="all">전체</MenuItem>
        <MenuItem value="pending">진행중</MenuItem>
        <MenuItem value="completed">완료</MenuItem>
        <MenuItem value="cancelled">취소</MenuItem>
      </TextField>
    </Box>
  );
}
