import type { Client } from '@entities/client';

import { Button } from '@shared/ui';

import { exportClientsToXlsx } from '../lib/export-clients';

type Props = { clients: Client[]; disabled?: boolean };

export function ExportClientsButton({ clients, disabled }: Props) {
  return (
    <Button
      variant="outlined"
      disabled={disabled || clients.length === 0}
      onClick={() => exportClientsToXlsx(clients)}
    >
      Excel 내보내기
    </Button>
  );
}
