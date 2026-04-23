import type { Client, ClientFormValues } from '@entities/client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

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
} from '@shared/ui';

import {
  useCreateClient,
  useUpdateClient,
  clientFormSchema,
  emptyClientFormValues,
} from '@entities/client';

type Props = {
  open: boolean;
  initial?: Client | null;
  onClose: () => void;
};

export function ClientFormDialog({ open, initial, onClose }: Props) {
  const notify = useNotify();
  const createMut = useCreateClient();
  const updateMut = useUpdateClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: emptyClientFormValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              name: initial.name,
              ceoName: initial.ceoName ?? '',
              ceoContact: initial.ceoContact ?? '',
              address: initial.address ?? '',
              managerName: initial.managerName ?? '',
              managerContact: initial.managerContact ?? '',
              status: initial.status,
            }
          : emptyClientFormValues
      );
    }
  }, [open, initial, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (initial) {
        await updateMut.mutateAsync({ id: initial.id, input: values });
        notify.success('거래처가 수정되었습니다');
      } else {
        await createMut.mutateAsync(values);
        notify.success('거래처가 등록되었습니다');
      }
      onClose();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : '저장 실패');
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? '거래처 수정' : '거래처 등록'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="거래처명 *"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="ceoName"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="대표명"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="ceoContact"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="대표 연락처"
                  fullWidth
                  placeholder="010-0000-0000"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="주소"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="managerName"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="담당자명"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="managerContact"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="담당자 연락처"
                  fullWidth
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
                  label="상태"
                  select
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="active">활성</MenuItem>
                  <MenuItem value="inactive">비활성</MenuItem>
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
