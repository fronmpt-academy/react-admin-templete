import { Box, Grid, Typography } from '@shared/ui';

import { SummaryCards } from '@widgets/dashboard-summary';
import { TopClients, RecentTransactions } from '@widgets/dashboard-lists';
import { MonthlyAmountChart, StatusDistributionChart } from '@widgets/dashboard-charts';

export function DashboardView() {
  return (
    <Box p={3}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        대시보드
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
        <SummaryCards />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <MonthlyAmountChart />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatusDistributionChart />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <RecentTransactions />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TopClients />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
