export const REALTIME_EVENTS = {
  COMMENT_CREATED: 'COMMENT_CREATED',
  COMMENT_UPDATED: 'COMMENT_UPDATED',
  COMMENT_DELETED: 'COMMENT_DELETED',

  MENTION_CREATED: 'MENTION_CREATED',

  ACTIVITY_CREATED: 'ACTIVITY_CREATED',

  NOTIFICATION_CREATED: 'NOTIFICATION_CREATED',
  NOTIFICATION_READ: 'NOTIFICATION_READ',
} as const;

export type RealtimeEventType =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export type RealtimeEvent<T = unknown> = {
  type: RealtimeEventType;
  payload: T;
  timestamp: string;
};