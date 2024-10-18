import { useEffect } from 'react'

/* eslint-disable no-underscore-dangle */
export function useMatomo() {
  const matomoUrl = import.meta.env.FRONTEND_MATOMO_URL
  const matomoSiteId = import.meta.env.FRONTEND_MATOMO_ID
  const isMatomoActivated = matomoUrl && matomoSiteId

  useEffect(() => {
    if (!isMatomoActivated) {
      return
    }

    const normalizedMatomoUrl = matomoUrl[matomoUrl.length - 1] !== '/' ? `${matomoUrl}/` : matomoUrl

    if (typeof window === 'undefined') {
      return
    }

    window._paq = window._paq || []

    window._paq.push(['trackPageView'])
    window._paq.push(['enableLinkTracking'])
    window._paq.push(['setTrackerUrl', `${normalizedMatomoUrl}matomo.php`])
    window._paq.push(['setSiteId', matomoSiteId])

    const doc = document
    const scriptElement = doc.createElement('script')
    const scripts = doc.getElementsByTagName('script')[0]

    scriptElement.type = 'text/javascript'
    scriptElement.async = true
    scriptElement.defer = true
    scriptElement.src = `${normalizedMatomoUrl}matomo.js`

    if (scripts && scripts.parentNode) {
      scripts.parentNode.insertBefore(scriptElement, scripts)
    }
  }, [matomoSiteId, matomoUrl, isMatomoActivated])

  return null
}
/* eslint-enable no-underscore-dangle */
