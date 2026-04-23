import type { ReactNode } from 'react';

import { SnackbarProvider } from 'notistack';

type Props = { children: ReactNode };

export function AppNotifyProvider({ children }: Props) {
  return (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      {children}
    </SnackbarProvider>
  );
}
