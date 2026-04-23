import { CONFIG } from '@shared/config';

import { ForgotPasswordForm } from '@features/auth';

export default function Page() {
  return (
    <>
      <title>{`Forgot password - ${CONFIG.appName}`}</title>
      <ForgotPasswordForm />
    </>
  );
}
