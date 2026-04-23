import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { updateProfile, createUserWithEmailAndPassword } from 'firebase/auth';

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

import { ensureUserProfile } from '@entities/auth';

import { signUpSchema } from '../model/schema';

import type { SignUpValues } from '../model/schema';

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const notify = useNotify();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', displayName: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, displayName, password }) => {
    try {
      const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(user, { displayName });
      await ensureUserProfile(user.uid, { email, displayName });
      notify.success('가입이 완료되었습니다');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      notify.error(error instanceof Error ? error.message : '가입에 실패했습니다');
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h5">회원가입</Typography>

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
        name="displayName"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="표시 이름"
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
        가입하기
      </Button>
      <Link component={RouterLink} to="/sign-in" variant="body2" textAlign="center">
        이미 계정이 있나요? 로그인
      </Link>
    </Box>
  );
}
