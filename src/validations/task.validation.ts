import { z } from 'zod';

const taskStatuses = [
  'TODO',
  'IN_PROGRESS',
  'DONE',
] as const;

const taskPriorities = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
] as const;

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(200),

  description: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  status: z
    .enum(taskStatuses)
    .default('TODO'),

  priority: z
    .enum(taskPriorities)
    .default('MEDIUM'),

  projectId: z
    .number()
    .int()
    .positive(),

  assigneeId: z
    .number()
    .int()
    .positive()
    .optional(),

  dueDate: z
    .string()
    .datetime()
    .optional(),
});