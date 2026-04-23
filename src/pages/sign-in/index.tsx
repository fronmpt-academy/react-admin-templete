import { CONFIG } from '@shared/config';

import { SignInForm } from '@features/auth';

export default function Page() {
  return (
    <>
      <title>{`Sign in - ${CONFIG.appName}`}</title>
      <SignInForm />
    </>
  );
}
