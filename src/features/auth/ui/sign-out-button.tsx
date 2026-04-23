import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import { Button } from '@shared/ui';
import { useNotify } from '@shared/lib/notify';
import { firebaseAuth } from '@shared/api/firebase';

export function SignOutButton() {
  const navigate = useNavigate();
  const notify = useNotify();

  const onClick = async () => {
    try {
      await signOut(firebaseAuth);
      navigate('/sign-in', { replace: true });
    } catch (error) {
      notify.error(error instanceof Error ? error.message : '로그아웃에 실패했습니다');
    }
  };

  return (
    <Button onClick={onClick} variant="outlined" size="small">
      로그아웃
    </Button>
  );
}
