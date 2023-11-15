export class EventSourceNotAvailableError extends Error {
  constructor() {
    super(
      'EventSource not available.\n' +
        'Consider loading an EventSource polyfill and making it available globally as EventSource, ' +
        'or passing one in as eventSourceClass to the ReconnectingEventSource constructor.'
    )
  }
}
