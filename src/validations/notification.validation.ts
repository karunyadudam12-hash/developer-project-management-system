import { z } from 'zod';

export const notificationSchema = z.object({
  userId: z
    .number()
    .int()
    .positive(),

  actorId: z
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

  projectId: z
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

  message: z
    .string()
    .trim()
    .min(1)
    .max(500),
});