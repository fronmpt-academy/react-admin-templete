import type { Transaction } from '@entities/transaction';

import { Button } from '@shared/ui';

import { exportTransactionsToXlsx } from '../lib/export-transactions';

type Props = { items: Transaction[]; disabled?: boolean };

export function ExportTransactionsButton({ items, disabled }: Props) {
  return (
    <Button
      variant="outlined"
      disabled={disabled || items.length === 0}
      onClick={() => exportTransactionsToXlsx(items)}
    >
      Excel 내보내기
    </Button>
  );
}
