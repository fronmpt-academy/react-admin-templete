import { z } from 'zod';

const emailField = z
  .string()
  .min(1, '이메일을 입력하세요')
  .email('이메일 형식이 올바르지 않습니다');

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});

export const signUpSchema = z.object({
  email: emailField,
  displayName: z.string().min(1, '이름을 입력하세요').max(40, '40자 이내로 입력하세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
