import { z } from 'zod';

export const transactionFormSchema = z.object({
  clientId: z.string().min(1, '거래처를 선택하세요'),
  clientName: z.string().min(1),
  date: z.date({ error: '거래일시를 입력하세요' }),
  items: z.string().min(1, '거래항목을 입력하세요').max(120),
  amount: z.coerce.number().positive('금액은 0보다 커야 합니다'),
  status: z.enum(['pending', 'completed', 'cancelled']),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export const emptyTransactionFormValues: TransactionFormValues = {
  clientId: '',
  clientName: '',
  date: new Date(),
  items: '',
  amount: 0,
  status: 'pending',
};
