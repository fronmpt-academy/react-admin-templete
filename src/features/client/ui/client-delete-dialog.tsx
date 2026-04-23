import type { Client } from '@entities/client';

import { useNotify } from '@shared/lib/notify';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@shared/ui';

import { useDeleteClient } from '@entities/client';

type Props = {
  target: Client | null;
  onClose: () => void;
};

export function ClientDeleteDialog({ target, onClose }: Props) {
  const notify = useNotify();
  const mut = useDeleteClient();

  const onConfirm = async () => {
    if (!target) return;
    try {
      await mut.mutateAsync(target.id);
      notify.success('거래처가 삭제되었습니다');
      onClose();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : '삭제 실패');
    }
  };

  return (
    <Dialog open={!!target} onClose={onClose}>
      <DialogTitle>거래처 삭제</DialogTitle>
      <DialogContent>
        <DialogContentText>
          거래처를 삭제하면 관련 거래 내역은 유지됩니다. 삭제하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={mut.isPending}>
          삭제
        </Button>
      </DialogActions>
    </Dialog>
  );
}
