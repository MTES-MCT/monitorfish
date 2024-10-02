type TrackEvent = {
  action: string
  category: string
  name: string
}

type Tracking = {
  trackEvent: (event: TrackEvent) => void
  trackPage: (pageTitle: string) => void
  trackUserId: (userId: string) => void
}

/**
 * Wrapper of Matomo script injected in `index.html`.
 *
 *
 * @see https://developer.matomo.org/guides/tracking-javascript-guide
 */
export function useTracking(): Tracking {
  /* eslint-disable no-underscore-dangle */
  return {
    trackEvent: ({ action, category, name }) => {
      window._paq?.push(['trackEvent', category, action, name])
    },
    trackPage: pageTitle => {
      window._paq?.push(['setDocumentTitle', pageTitle])
      window._paq?.push(['trackPageView'])
    },
    trackUserId: userId => {
      window._paq?.push(['setUserId', userId])
      window._paq?.push(['enableHeartBeatTimer', 30])
    }
  }
  /* eslint-enable no-underscore-dangle */
}
