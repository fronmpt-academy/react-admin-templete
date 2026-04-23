import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

import { Card, Skeleton, Typography, CardContent } from '@shared/ui';

import { useTransactions } from '@entities/transaction';

export function StatusDistributionChart() {
  const { data: items = [], isLoading } = useTransactions();

  const { labels, series } = useMemo(() => {
    const counts = { pending: 0, completed: 0, cancelled: 0 };
    items.forEach((t) => {
      counts[t.status] += 1;
    });
    return {
      labels: ['진행중', '완료', '취소'],
      series: [counts.pending, counts.completed, counts.cancelled],
    };
  }, [items]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          거래 상태 분포
        </Typography>
        {isLoading ? (
          <Skeleton variant="rectangular" height={280} />
        ) : (
          <ReactApexChart
            type="donut"
            height={280}
            series={series}
            options={{ labels, legend: { position: 'bottom' } }}
          />
        )}
      </CardContent>
    </Card>
  );
}
