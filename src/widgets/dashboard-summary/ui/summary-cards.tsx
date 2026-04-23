import { useMemo } from 'react';

import { dayjs, formatCurrencyKRW } from '@shared/lib/date';
import { Card, Grid, Skeleton, Typography, CardContent } from '@shared/ui';

import { useClients } from '@entities/client';
import { useTransactions } from '@entities/transaction';

export function SummaryCards() {
  const clients = useClients();
  const transactions = useTransactions();

  const stats = useMemo(() => {
    const monthStart = dayjs().tz('Asia/Seoul').startOf('month');
    const monthEnd = dayjs().tz('Asia/Seoul').endOf('month');
    const cs = clients.data ?? [];
    const ts = transactions.data ?? [];

    const newClientsThisMonth = cs.filter((c) =>
      dayjs(c.createdAt).isAfter(monthStart)
    ).length;
    const completedAmount = ts
      .filter((t) => t.status === 'completed')
      .reduce((s, t) => s + t.amount, 0);
    const thisMonthCompletedAmount = ts
      .filter(
        (t) =>
          t.status === 'completed' &&
          dayjs(t.date).isAfter(monthStart) &&
          dayjs(t.date).isBefore(monthEnd)
      )
      .reduce((s, t) => s + t.amount, 0);
    const thisMonthTxCount = ts.filter(
      (t) => dayjs(t.date).isAfter(monthStart) && dayjs(t.date).isBefore(monthEnd)
    ).length;
    const pendingCount = ts.filter((t) => t.status === 'pending').length;

    return {
      totalClients: cs.length,
      newClientsThisMonth,
      completedAmount,
      thisMonthCompletedAmount,
      thisMonthTxCount,
      pendingCount,
    };
  }, [clients.data, transactions.data]);

  const loading = clients.isLoading || transactions.isLoading;

  const card = (title: string, primary: string, secondary?: string) => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {loading ? (
          <Skeleton width={120} height={36} />
        ) : (
          <Typography variant="h5">{primary}</Typography>
        )}
        {secondary && !loading && (
          <Typography variant="caption" color="text.secondary">
            {secondary}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        {card(
          '전체 거래처 수',
          `${stats.totalClients}`,
          `이번 달 신규 ${stats.newClientsThisMonth}`
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        {card(
          '전체 거래금액 (완료)',
          formatCurrencyKRW(stats.completedAmount),
          `이번 달 ${formatCurrencyKRW(stats.thisMonthCompletedAmount)}`
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        {card('이번 달 거래 건수', `${stats.thisMonthTxCount}`)}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        {card('진행중 거래 건수', `${stats.pendingCount}`)}
      </Grid>
    </Grid>
  );
}
