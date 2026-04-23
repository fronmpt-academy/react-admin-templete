import { useEffect } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { dayjs } from '@shared/lib/date';
import { Fab, Iconify } from '@shared/ui';
import { usePathname } from '@shared/router';
import { ThemeProvider } from '@shared/theme';
import { AppQueryProvider } from '@shared/lib/query';
import { AppNotifyProvider } from '@shared/lib/notify';

import { AuthProvider } from '@entities/auth';

import '@app/styles/global.css';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  const githubButton = () => (
    <Fab
      size="medium"
      aria-label="Github"
      href="https://github.com/minimal-ui-kit/material-kit-react"
      sx={{
        zIndex: 9,
        right: 20,
        bottom: 20,
        width: 48,
        height: 48,
        position: 'fixed',
        bgcolor: 'grey.800',
      }}
    >
      <Iconify width={24} icon="socials:github" sx={{ '--color': 'white' }} />
    </Fab>
  );

  return (
    <ThemeProvider>
      <AppQueryProvider>
        <AppNotifyProvider>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            dateLibInstance={dayjs}
            adapterLocale="ko"
          >
            <AuthProvider>
              {children}
              {githubButton()}
            </AuthProvider>
          </LocalizationProvider>
        </AppNotifyProvider>
      </AppQueryProvider>
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
