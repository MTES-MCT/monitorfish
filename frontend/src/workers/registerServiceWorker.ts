import { SERVICE_WORKER_PATH } from './settings'

/**
 * The register() method of the ServiceWorkerContainer interface creates or updates a ServiceWorkerRegistration for the given scriptURL.
 *
 * @note "You can call this method unconditionally from the controlled page. I.e., you don't need to first check whether there's an active registration."
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
 *
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      let refreshing = false

      // detect controller change and refresh the page
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload()
          refreshing = true
        }
      })

      const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
        scope: '/'
      })

      registration.addEventListener('updatefound', () => {
        // eslint-disable-next-line no-console
        console.log('Service Worker update detected!')
      })

      if (registration.installing) {
        // eslint-disable-next-line no-console
        console.log('Service worker installing')
      } else if (registration.waiting) {
        // eslint-disable-next-line no-console
        console.log('Service worker installed')
      } else if (registration.active) {
        // eslint-disable-next-line no-console
        console.log('Service worker active')
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Service worker registration failed with ${error}`)
    }
  }
}
