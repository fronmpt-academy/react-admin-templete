import { CONFIG } from '@shared/config';

import { SignInView } from '@features/auth';

export default function Page() {
  return (
    <>
      <title>{`Sign in - ${CONFIG.appName}`}</title>
      <SignInView />
    </>
  );
}
