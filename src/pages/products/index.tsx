import { CONFIG } from '@shared/config';

import { ProductsView } from './ui/products-view';

export default function Page() {
  return (
    <>
      <title>{`Products - ${CONFIG.appName}`}</title>
      <ProductsView />
    </>
  );
}
