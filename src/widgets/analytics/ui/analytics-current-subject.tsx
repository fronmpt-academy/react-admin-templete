import type { ChartOptions } from '@shared/ui';
import type { CardProps } from '@mui/material/Card';

import { Card, Chart, Divider , useChart, useTheme, CardHeader, ChartLegends } from '@shared/ui';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories: string[];
    series: {
      name: string;
      data: number[];
    }[];
    options?: ChartOptions;
  };
};

export function AnalyticsCurrentSubject({ title, subheader, chart, sx, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 2 },
    fill: { opacity: 0.48 },
    xaxis: {
      categories: chart.categories,
      labels: { style: { colors: Array.from({ length: 6 }, () => theme.palette.text.secondary) } },
    },
    ...chart.options,
  });

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="radar"
        series={chart.series}
        options={chartOptions}
        slotProps={{ loading: { py: 2.5 } }}
        sx={{
          my: 1,
          mx: 'auto',
          width: 300,
          height: 300,
        }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <ChartLegends
        labels={chart.series.map((item) => item.name)}
        colors={chartOptions?.colors}
        sx={{ p: 3, justifyContent: 'center' }}
      />
    </Card>
  );
}
