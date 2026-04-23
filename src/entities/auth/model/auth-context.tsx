import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';

import { onAuthStateChanged } from 'firebase/auth';
import { useMemo, useState, useEffect } from 'react';

import { firebaseAuth } from '@shared/api/firebase';
import { AuthContext } from '@shared/router/components';

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(firebaseAuth.currentUser);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (next) => {
      setUser(next);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ user, initializing }), [user, initializing]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
