import { z } from 'zod';

export const mentionSchema = z.object({
  commentId: z
    .number()
    .int()
    .positive(),

  userId: z
    .number()
    .int()
    .positive(),
});