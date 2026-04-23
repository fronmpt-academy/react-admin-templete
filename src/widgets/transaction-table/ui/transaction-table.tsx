import type { Transaction } from '@entities/transaction';

import { useMemo, useState } from 'react';

import { dayjs, formatDateTime, formatCurrencyKRW } from '@shared/lib/date';
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

import { useTransactions, TransactionStatusChip } from '@entities/transaction';

import { TransactionFilters } from './transaction-filters';

import type { TransactionFilterState } from './transaction-filters';

type Props = {
  onCreate: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  renderToolbarRight?: (filtered: Transaction[]) => React.ReactNode;
};

const initialFilters: TransactionFilterState = {
  search: '',
  status: 'all',
  start: null,
  end: null,
};

export function TransactionTable({ onCreate, onEdit, onDelete, renderToolbarRight }: Props) {
  const { data: items = [], isLoading } = useTransactions();
  const [filters, setFilters] = useState<TransactionFilterState>(initialFilters);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const needle = filters.search.trim().toLowerCase();
    const start = filters.start?.startOf('day');
    const end = filters.end?.endOf('day');

    return items.filter((t) => {
      if (filters.status !== 'all' && t.status !== filters.status) return false;
      if (needle && !t.clientName.toLowerCase().includes(needle)) return false;
      const d = dayjs(t.date);
      if (start && d.isBefore(start)) return false;
      if (end && d.isAfter(end)) return false;
      return true;
    });
  }, [items, filters]);

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
        <TransactionFilters value={filters} onChange={setFilters} />
        <Stack direction="row" gap={1}>
          {renderToolbarRight?.(filtered)}
          <IconButton color="primary" onClick={onCreate} aria-label="거래 등록">
            <Iconify icon="mingcute:add-line" />
          </IconButton>
        </Stack>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>거래일시</TableCell>
                <TableCell>거래처명</TableCell>
                <TableCell>거래항목</TableCell>
                <TableCell align="right">거래금액</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="right">액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Skeleton height={120} />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      조회된 거래가 없습니다. 우측 상단 + 버튼으로 추가하세요.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                paged.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{formatDateTime(t.date)}</TableCell>
                    <TableCell>{t.clientName}</TableCell>
                    <TableCell>{t.items}</TableCell>
                    <TableCell align="right">{formatCurrencyKRW(t.amount)}</TableCell>
                    <TableCell>
                      <TransactionStatusChip status={t.status} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => onEdit(t)} aria-label="수정">
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton onClick={() => onDelete(t)} aria-label="삭제" color="error">
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
