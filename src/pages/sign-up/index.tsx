import { CONFIG } from '@shared/config';

import { SignUpForm } from '@features/auth';

export default function Page() {
  return (
    <>
      <title>{`Sign up - ${CONFIG.appName}`}</title>
      <SignUpForm />
    </>
  );
}
