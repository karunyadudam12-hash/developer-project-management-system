import {
  type RealtimeEvent,
  type RealtimeEventType,
} from './realtime-events';

type EventListener = (
  event: RealtimeEvent
) => void;

const listeners = new Map<
  RealtimeEventType,
  Set<EventListener>
>();

export function subscribeToRealtimeEvent(
  type: RealtimeEventType,
  listener: EventListener
) {
  let typeListeners =
    listeners.get(type);

  if (!typeListeners) {
    typeListeners = new Set<EventListener>();
    listeners.set(type, typeListeners);
  }

  typeListeners.add(listener);

  return () => {
    typeListeners?.delete(listener);

    if (
      typeListeners &&
      typeListeners.size === 0
    ) {
      listeners.delete(type);
    }
  };
}

export function handleRealtimeEvent(
  event: RealtimeEvent
) {
  const typeListeners =
    listeners.get(event.type);

  if (!typeListeners) {
    return;
  }

  for (const listener of typeListeners) {
    listener(event);
  }
}