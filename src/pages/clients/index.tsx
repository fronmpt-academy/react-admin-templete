import { CONFIG } from '@shared/config';

import { ClientsPage } from './ui/clients-page';

export default function Page() {
  return (
    <>
      <title>{`거래처 관리 - ${CONFIG.appName}`}</title>
      <ClientsPage />
    </>
  );
}
