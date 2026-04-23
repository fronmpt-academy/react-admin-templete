import type { ReactNode } from 'react';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { createQueryClient } from './client';

type Props = { children: ReactNode };

export function AppQueryProvider({ children }: Props) {
  const [client] = useState(() => createQueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
