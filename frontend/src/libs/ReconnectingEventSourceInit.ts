export interface ReconnectingEventSourceInit extends EventSourceInit {
  // the EventSource class to wrap. This allows the use of a polyfill or alternate
  // implementation instead of the platform-provided EventSource class.
  eventSourceClass?: typeof EventSource

  // the last event
  lastEventId?: string

  // the maximum time to wait before attempting to reconnect in ms, default `3000`
  // note: wait time is randomised to prevent all clients from attempting to reconnect simultaneously
  max_retry_time?: number
}
