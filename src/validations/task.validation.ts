import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: z.string().default('TODO'),
  priority: z.string().default('MEDIUM'),
  projectId: z.number().int().positive(),
  assigneeId: z.number().int().positive().optional(),
});