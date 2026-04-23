import { CONFIG } from '@shared/config';

import { NotFoundView } from './ui/not-found-view';

export default function Page() {
  return (
    <>
      <title>{`404 page not found! | Error - ${CONFIG.appName}`}</title>
      <NotFoundView />
    </>
  );
}
