import {
  type RealtimeEvent,
  type RealtimeEventType,
} from './realtime-events';

const listeners = new Set<
  (event: RealtimeEvent) => void
>();

export function subscribeRealtime(
  listener: (event: RealtimeEvent) => void
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function publishRealtime<T>(
  type: RealtimeEventType,
  payload: T
) {
  const event: RealtimeEvent<T> = {
    type,
    payload,
    timestamp:
      new Date().toISOString(),
  };

  for (const listener of listeners) {
    listener(event);
  }

  return event;
}