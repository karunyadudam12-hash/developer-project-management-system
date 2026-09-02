import type { KanbanStatus } from './kanban';

export const KANBAN_TRANSITIONS: Record<
  KanbanStatus,
  KanbanStatus[]
> = {
  TODO: [
    'TODO',
    'IN_PROGRESS',
  ],

  IN_PROGRESS: [
    'TODO',
    'IN_PROGRESS',
    'DONE',
  ],

  DONE: [
    'IN_PROGRESS',
    'DONE',
  ],
};

export function canMoveTask(
  from: KanbanStatus,
  to: KanbanStatus
) {
  return KANBAN_TRANSITIONS[from].includes(
    to
  );
}