import type { ReactNode } from 'react';

import { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import { Box, LinearProgress } from '@shared/ui';

import { AuthContext } from './auth-context-bridge';

type Props = { children: ReactNode };

export function AuthGuard({ children }: Props) {
  const { user, initializing } = useContext(AuthContext);

  if (initializing) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <LinearProgress sx={{ width: 240 }} />
      </Box>
    );
  }

  if (!user) return <Navigate to="/sign-in" replace />;
  return <>{children}</>;
}
