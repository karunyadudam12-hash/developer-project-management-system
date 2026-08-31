import { z } from 'zod';

export const labelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Label name is required')
    .max(50, 'Label name must be 50 characters or less'),
});