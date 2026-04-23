import { useMemo } from 'react';

import { formatCurrencyKRW } from '@shared/lib/date';
import {
  Card,
  List,
  ListItem,
  Skeleton,
  Typography,
  CardContent,
  ListItemText,
} from '@shared/ui';

import { useTransactions } from '@entities/transaction';

export function TopClients() {
  const { data: items = [], isLoading } = useTransactions();

  const top = useMemo(() => {
    const totals = new Map<string, { name: string; amount: number }>();
    items.forEach((t) => {
      if (t.status !== 'completed') return;
      const cur = totals.get(t.clientId);
      totals.set(t.clientId, {
        name: t.clientName,
        amount: (cur?.amount ?? 0) + t.amount,
      });
    });
    return [...totals.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [items]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          거래금액 기준 상위 거래처
        </Typography>
        {isLoading && <Skeleton height={160} />}
        {!isLoading && top.length === 0 && (
          <Typography color="text.secondary">표시할 데이터가 없습니다.</Typography>
        )}
        {!isLoading && top.length > 0 && (
          <List dense disablePadding>
            {top.map((row) => (
              <ListItem key={row.name} disableGutters>
                <ListItemText primary={row.name} secondary={formatCurrencyKRW(row.amount)} />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
