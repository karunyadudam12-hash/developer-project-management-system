import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1).max(100),

  description: z
    .string()
    .max(500)
    .optional(),

  status: z
    .enum(['ACTIVE', 'COMPLETED', 'ARCHIVED'])
    .default('ACTIVE'),
});