import { z } from 'zod';

export const waitlistSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  telegram: z.string().optional(),
  useCase: z.string().optional(),
  consent: z.boolean().refine(val => val === true, 'Необходимо согласие на обработку данных')
});

export type WaitlistFormData = z.infer<typeof waitlistSchema>;
