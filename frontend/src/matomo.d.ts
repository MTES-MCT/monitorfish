export {}

declare global {
  interface Window {
    _paq: MatomoQueue
  }

  type MatomoEventCategory = string
  type MatomoEventAction = string
  type MatomoEventName = string
  type MatomoEventValue = number

  interface MatomoQueue {
    push: (args: MatomoCommand) => {}
  }

  type MatomoCommand =
    | ['trackPageView']
    | ['enableLinkTracking']
    | ['setTrackerUrl', string]
    | ['setSiteId', number | string]
    | ['trackEvent', MatomoEventCategory, MatomoEventAction, MatomoEventName?, MatomoEventValue?]
    | ['setUserId', string]
    | ['enableHeartBeatTimer', number]
    | ['setCustomUrl', string]
    | ['setDocumentTitle', string]
    | ['setCookieConsentGiven']
    | ['trackLink', string, string]
}
