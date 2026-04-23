import type { User } from 'firebase/auth';

import { createContext } from 'react';

export type SharedAuthState = {
  user: User | null;
  initializing: boolean;
};

export const AuthContext = createContext<SharedAuthState>({
  user: null,
  initializing: true,
});
