import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

import { dayjs } from '@shared/lib/date';
import { Card, Skeleton, Typography, CardContent } from '@shared/ui';

import { useTransactions } from '@entities/transaction';

export function MonthlyAmountChart() {
  const { data: items = [], isLoading } = useTransactions();

  const { categories, series } = useMemo(() => {
    const now = dayjs().tz('Asia/Seoul').startOf('month');
    const months = Array.from({ length: 12 }, (_, i) => now.subtract(11 - i, 'month'));
    const buckets = months.map(() => 0);

    items.forEach((t) => {
      if (t.status !== 'completed') return;
      const d = dayjs(t.date).tz('Asia/Seoul').startOf('month');
      const idx = months.findIndex((m) => m.isSame(d, 'month'));
      if (idx >= 0) buckets[idx] += t.amount;
    });

    return {
      categories: months.map((m) => m.format('YY.MM')),
      series: [{ name: '완료 거래금액', data: buckets }],
    };
  }, [items]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          월별 거래금액 추이 (최근 12개월)
        </Typography>
        {isLoading ? (
          <Skeleton variant="rectangular" height={280} />
        ) : (
          <ReactApexChart
            type="bar"
            height={280}
            series={series}
            options={{
              chart: { toolbar: { show: false } },
              xaxis: { categories },
              dataLabels: { enabled: false },
              yaxis: {
                labels: { formatter: (v) => new Intl.NumberFormat('ko-KR').format(v) },
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
