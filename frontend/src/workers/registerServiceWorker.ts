export const registerServiceWorker = async () => {
  const swPath = `${process.env.PUBLIC_URL}/sw.js`

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(swPath, {
        scope: '/'
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
