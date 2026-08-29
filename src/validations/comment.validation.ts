import { z } from 'zod';

export const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  taskId: z.number().int().positive(),
  authorId: z.number().int().positive(),
});