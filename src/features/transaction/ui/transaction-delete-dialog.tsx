import type { Transaction } from '@entities/transaction';

import { useNotify } from '@shared/lib/notify';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@shared/ui';

import { useDeleteTransaction } from '@entities/transaction';

type Props = {
  target: Transaction | null;
  onClose: () => void;
};

export function TransactionDeleteDialog({ target, onClose }: Props) {
  const notify = useNotify();
  const mut = useDeleteTransaction();

  const onConfirm = async () => {
    if (!target) return;
    try {
      await mut.mutateAsync(target.id);
      notify.success('거래가 삭제되었습니다');
      onClose();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : '삭제 실패');
    }
  };

  return (
    <Dialog open={!!target} onClose={onClose}>
      <DialogTitle>거래 삭제</DialogTitle>
      <DialogContent>
        <DialogContentText>해당 거래를 삭제하시겠습니까?</DialogContentText>
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
