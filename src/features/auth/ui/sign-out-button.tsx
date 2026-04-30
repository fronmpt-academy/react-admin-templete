import { Button } from '@shared/ui';

import { useSignOut } from '../model/use-sign-out';

export function SignOutButton() {
  const signOut = useSignOut();

  return (
    <Button onClick={signOut} variant="outlined" size="small">
      로그아웃
    </Button>
  );
}
