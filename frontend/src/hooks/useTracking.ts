type TrackEvent = {
  action: string
  category: string
  name: string
  value?: number
}

type Tracking = {
  trackEvent: (event: TrackEvent) => void
  trackPage: (pageTitle: string) => void
  trackUserId: (userId: string) => void
}

/* eslint-disable no-underscore-dangle */
export function trackEvent({ action, category, name, value }: TrackEvent) {
  if (!value) {
    window._paq?.push(['trackEvent', category, action, name])

    return
  }

  window._paq?.push(['trackEvent', category, action, name, value])
}

/**
 * Wrapper of UseMatomo script injected in `index.html`.
 *
 *
 * @see https://developer.matomo.org/guides/tracking-javascript-guide
 */
export function useTracking(): Tracking {
  return {
    trackEvent,
    trackPage: pageTitle => {
      window._paq?.push(['setDocumentTitle', pageTitle])
      window._paq?.push(['trackPageView'])
    },
    trackUserId: userId => {
      window._paq?.push(['setUserId', userId])
      window._paq?.push(['enableHeartBeatTimer', 30])
    }
  }
}
/* eslint-enable no-underscore-dangle */
