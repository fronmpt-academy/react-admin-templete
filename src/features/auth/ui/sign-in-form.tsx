import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

import { useNotify } from '@shared/lib/notify';
import { firebaseAuth } from '@shared/api/firebase';
import {
  Box,
  Link,
  Button,
  Iconify,
  TextField,
  IconButton,
  Typography,
  InputAdornment,
} from '@shared/ui';

import { signInSchema } from '../model/schema';

import type { SignInValues } from '../model/schema';

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const notify = useNotify();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, values.email, values.password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      notify.error(error instanceof Error ? error.message : '로그인에 실패했습니다');
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h5">로그인</Typography>

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

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="비밀번호"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                      <Iconify
                        icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      />

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
        로그인
      </Button>

      <Box display="flex" justifyContent="space-between">
        <Link component={RouterLink} to="/forgot-password" variant="body2">
          비밀번호 찾기
        </Link>
        <Link component={RouterLink} to="/sign-up" variant="body2">
          회원가입
        </Link>
      </Box>
    </Box>
  );
}
