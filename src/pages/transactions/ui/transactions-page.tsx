import type { Transaction } from '@entities/transaction';

import { useState } from 'react';

import { Box, Typography } from '@shared/ui';

import {
  TransactionFormDialog,
  TransactionDeleteDialog,
  ExportTransactionsButton,
} from '@features/transaction';

import { TransactionTable } from '@widgets/transaction-table';

export function TransactionsPage() {
  const [formTarget, setFormTarget] = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  return (
    <Box p={3}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        거래 관리
      </Typography>

      <TransactionTable
        onCreate={() => {
          setFormTarget(null);
          setFormOpen(true);
        }}
        onEdit={(t) => {
          setFormTarget(t);
          setFormOpen(true);
        }}
        onDelete={(t) => setDeleteTarget(t)}
        renderToolbarRight={(filtered) => <ExportTransactionsButton items={filtered} />}
      />

      <TransactionFormDialog
        open={formOpen}
        initial={formTarget}
        onClose={() => setFormOpen(false)}
      />

      <TransactionDeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
