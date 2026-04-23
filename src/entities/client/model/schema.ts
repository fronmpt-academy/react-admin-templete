import { z } from 'zod';

const contact = z
  .string()
  .regex(/^[0-9-]*$/, '숫자와 하이픈만 입력하세요')
  .optional()
  .or(z.literal(''));

export const clientFormSchema = z.object({
  name: z.string().min(1, '거래처명을 입력하세요').max(60, '60자 이내'),
  ceoName: z.string().max(40).optional().or(z.literal('')),
  ceoContact: contact,
  address: z.string().max(120).optional().or(z.literal('')),
  managerName: z.string().max(40).optional().or(z.literal('')),
  managerContact: contact,
  status: z.enum(['active', 'inactive']),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const emptyClientFormValues: ClientFormValues = {
  name: '',
  ceoName: '',
  ceoContact: '',
  address: '',
  managerName: '',
  managerContact: '',
  status: 'active',
};
