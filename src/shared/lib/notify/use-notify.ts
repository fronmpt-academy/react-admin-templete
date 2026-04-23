import { useSnackbar } from 'notistack';

export function useNotify() {
  const { enqueueSnackbar } = useSnackbar();
  return {
    success: (message: string) => enqueueSnackbar(message, { variant: 'success' }),
    error: (message: string) => enqueueSnackbar(message, { variant: 'error' }),
    info: (message: string) => enqueueSnackbar(message, { variant: 'info' }),
  };
}
