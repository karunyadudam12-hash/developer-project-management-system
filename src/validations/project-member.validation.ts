import { z } from 'zod';

export const projectMemberSchema = z.object({
  projectId: z.number().int().positive(),
  userId: z.number().int().positive(),
});