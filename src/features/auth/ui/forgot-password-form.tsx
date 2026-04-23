import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';

import { useNotify } from '@shared/lib/notify';
import { firebaseAuth } from '@shared/api/firebase';
import { Box, Link, Button, TextField, Typography } from '@shared/ui';

import { forgotPasswordSchema } from '../model/schema';

import type { ForgotPasswordValues } from '../model/schema';

export function ForgotPasswordForm() {
  const notify = useNotify();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      notify.success('비밀번호 재설정 이메일을 발송했습니다');
      reset();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : '메일 발송에 실패했습니다');
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h5">비밀번호 재설정</Typography>

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="이메일"
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
        재설정 메일 보내기
      </Button>
      <Link component={RouterLink} to="/sign-in" variant="body2" textAlign="center">
        로그인으로 돌아가기
      </Link>
    </Box>
  );
}
