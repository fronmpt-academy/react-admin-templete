import { CONFIG } from '@shared/config';

import { UserView } from './ui/user-view';

export default function Page() {
  return (
    <>
      <title>{`Users - ${CONFIG.appName}`}</title>
      <UserView />
    </>
  );
}
