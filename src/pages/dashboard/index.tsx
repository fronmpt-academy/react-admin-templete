import { CONFIG } from '@shared/config';

import { DashboardView } from './ui/dashboard-view';

export default function Page() {
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <DashboardView />
    </>
  );
}
