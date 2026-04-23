import type { Client } from '@entities/client';

import { useState } from 'react';

import { Box, Typography } from '@shared/ui';

import {
  ClientFormDialog,
  ClientDeleteDialog,
  ExportClientsButton,
} from '@features/client';

import { ClientTable } from '@widgets/client-table';

export function ClientsPage() {
  const [formTarget, setFormTarget] = useState<Client | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  return (
    <Box p={3}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        거래처 관리
      </Typography>

      <ClientTable
        onCreate={() => {
          setFormTarget(null);
          setFormOpen(true);
        }}
        onEdit={(c) => {
          setFormTarget(c);
          setFormOpen(true);
        }}
        onDelete={(c) => setDeleteTarget(c)}
        renderToolbarRight={(filtered) => <ExportClientsButton clients={filtered} />}
      />

      <ClientFormDialog
        open={formOpen}
        initial={formTarget}
        onClose={() => setFormOpen(false)}
      />

      <ClientDeleteDialog target={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </Box>
  );
}
