/**
 * Make sure to reload the website for the service-worker to be effectively removed.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/unregister
 *
 */
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        // eslint-disable-next-line no-restricted-syntax
        for (const registration of registrations) {
          registration.unregister()
        }
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Service worker un-registration failed with ${error}`)
    }
  }
}
