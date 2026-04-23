import type { Transaction, TransactionFormValues } from '@entities/transaction';

import { useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { dayjs } from '@shared/lib/date';
import { useNotify } from '@shared/lib/notify';
import {
  Box,
  Button,
  Dialog,
  MenuItem,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment,
} from '@shared/ui';

import { useClients } from '@entities/client';
import {
  useCreateTransaction,
  useUpdateTransaction,
  transactionFormSchema,
  emptyTransactionFormValues,
} from '@entities/transaction';

type Props = {
  open: boolean;
  initial?: Transaction | null;
  onClose: () => void;
};

export function TransactionFormDialog({ open, initial, onClose }: Props) {
  const notify = useNotify();
  const createMut = useCreateTransaction();
  const updateMut = useUpdateTransaction();
  const { data: clients = [] } = useClients();
  const activeClients = useMemo(
    () => clients.filter((c) => c.status === 'active'),
    [clients]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: emptyTransactionFormValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              clientId: initial.clientId,
              clientName: initial.clientName,
              date: initial.date,
              items: initial.items,
              amount: initial.amount,
              status: initial.status,
            }
          : emptyTransactionFormValues
      );
    }
  }, [open, initial, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (initial) {
        await updateMut.mutateAsync({ id: initial.id, input: values });
        notify.success('거래가 수정되었습니다');
      } else {
        await createMut.mutateAsync(values);
        notify.success('거래가 등록되었습니다');
      }
      onClose();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : '저장 실패');
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? '거래 수정' : '거래 등록'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Controller
              name="clientId"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="거래처 *"
                  select
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(e) => {
                    const picked = activeClients.find((c) => c.id === e.target.value);
                    field.onChange(e.target.value);
                    setValue('clientName', picked?.name ?? '');
                  }}
                >
                  {activeClients.length === 0 && (
                    <MenuItem disabled value="">
                      활성 거래처가 없습니다
                    </MenuItem>
                  )}
                  {activeClients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="date"
              control={control}
              render={({ field, fieldState }) => (
                <DateTimePicker
                  label="거래일시 *"
                  value={dayjs(field.value)}
                  onChange={(v) => field.onChange(v?.toDate() ?? new Date())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message,
                    },
                  }}
                />
              )}
            />

            <Controller
              name="items"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="거래항목 *"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="amount"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
                  }
                  type="number"
                  label="거래금액 *"
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">원</InputAdornment>,
                    },
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="거래 상태 *"
                  select
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="pending">진행중</MenuItem>
                  <MenuItem value="completed">완료</MenuItem>
                  <MenuItem value="cancelled">취소</MenuItem>
                </TextField>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            저장
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
