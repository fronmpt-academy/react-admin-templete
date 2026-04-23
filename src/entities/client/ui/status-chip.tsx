import { Chip } from '@shared/ui';

import type { ClientStatus } from '../model/types';

const LABELS: Record<ClientStatus, string> = { active: '활성', inactive: '비활성' };

export function ClientStatusChip({ status }: { status: ClientStatus }) {
  return (
    <Chip
      size="small"
      color={status === 'active' ? 'success' : 'default'}
      label={LABELS[status]}
    />
  );
}
