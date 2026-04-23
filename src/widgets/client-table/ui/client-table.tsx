import type { Client, ClientStatus } from '@entities/client';

import { useMemo, useState } from 'react';

import {
  Box,
  Paper,
  Stack,
  Table,
  Iconify,
  Skeleton,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  TableContainer,
  TablePagination,
} from '@shared/ui';

import { useClients, ClientStatusChip } from '@entities/client';

import { ClientFilters } from './client-filters';

type Props = {
  onEdit: (c: Client) => void;
  onDelete: (c: Client) => void;
  onCreate: () => void;
  renderToolbarRight?: (filtered: Client[]) => React.ReactNode;
};

export function ClientTable({ onEdit, onDelete, onCreate, renderToolbarRight }: Props) {
  const { data: clients = [], isLoading } = useClients();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | ClientStatus>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (status !== 'all' && c.status !== status) return false;
      if (needle && !c.name.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [clients, search, status]);

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Stack gap={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <ClientFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />
        <Stack direction="row" gap={1}>
          {renderToolbarRight?.(filtered)}
          <IconButton color="primary" onClick={onCreate} aria-label="거래처 등록">
            <Iconify icon="mingcute:add-line" />
          </IconButton>
        </Stack>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>거래처명</TableCell>
                <TableCell>대표명</TableCell>
                <TableCell>대표 연락처</TableCell>
                <TableCell>담당자명</TableCell>
                <TableCell>담당자 연락처</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="right">액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Skeleton height={120} />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      등록된 거래처가 없습니다. 우측 상단 + 버튼으로 추가하세요.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                paged.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.ceoName ?? ''}</TableCell>
                    <TableCell>{c.ceoContact ?? ''}</TableCell>
                    <TableCell>{c.managerName ?? ''}</TableCell>
                    <TableCell>{c.managerContact ?? ''}</TableCell>
                    <TableCell>
                      <ClientStatusChip status={c.status} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => onEdit(c)} aria-label="수정">
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton onClick={() => onDelete(c)} aria-label="삭제" color="error">
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>
    </Stack>
  );
}
