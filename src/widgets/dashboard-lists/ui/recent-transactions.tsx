import { formatDateTime, formatCurrencyKRW } from '@shared/lib/date';
import {
  Card,
  List,
  ListItem,
  Skeleton,
  Typography,
  CardContent,
  ListItemText,
} from '@shared/ui';

import { useTransactions, TransactionStatusChip } from '@entities/transaction';

export function RecentTransactions() {
  const { data: items = [], isLoading } = useTransactions();
  const recent = [...items]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          최근 거래 내역
        </Typography>
        {isLoading && <Skeleton height={160} />}
        {!isLoading && recent.length === 0 && (
          <Typography color="text.secondary">표시할 거래가 없습니다.</Typography>
        )}
        {!isLoading && recent.length > 0 && (
          <List dense disablePadding>
            {recent.map((t) => (
              <ListItem
                key={t.id}
                disableGutters
                secondaryAction={<TransactionStatusChip status={t.status} />}
              >
                <ListItemText
                  primary={`${t.clientName} · ${t.items}`}
                  secondary={`${formatCurrencyKRW(t.amount)} · ${formatDateTime(t.date)}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
