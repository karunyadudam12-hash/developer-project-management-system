import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50).optional(),
  name: z.string().min(1).max(100).optional(),
  role: z.string().default('STAFF'),
});