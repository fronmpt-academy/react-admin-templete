import type { ClientStatus } from '@entities/client';

import { Box, MenuItem, TextField } from '@shared/ui';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: 'all' | ClientStatus;
  onStatusChange: (v: 'all' | ClientStatus) => void;
};

export function ClientFilters({ search, onSearchChange, status, onStatusChange }: Props) {
  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      <TextField
        label="거래처명 검색"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 240 }}
      />
      <TextField
        label="상태"
        select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as Props['status'])}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="all">전체</MenuItem>
        <MenuItem value="active">활성</MenuItem>
        <MenuItem value="inactive">비활성</MenuItem>
      </TextField>
    </Box>
  );
}
