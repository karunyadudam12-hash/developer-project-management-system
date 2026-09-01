import { z } from 'zod';

export const activitySchema = z.object({
  actorId: z
    .number()
    .int()
    .positive(),

  projectId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  taskId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  type: z
    .string()
    .trim()
    .min(1)
    .max(100),

  description: z
    .string()
    .trim()
    .min(1)
    .max(500),

  metadata: z
    .string()
    .max(5000)
    .nullable()
    .optional(),
});