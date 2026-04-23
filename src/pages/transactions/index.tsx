import { CONFIG } from '@shared/config';

import { TransactionsPage } from './ui/transactions-page';

export default function Page() {
  return (
    <>
      <title>{`거래 관리 - ${CONFIG.appName}`}</title>
      <TransactionsPage />
    </>
  );
}
