import { useEffect, useState } from 'react'

import { SERVICE_WORKER_PATH } from '../settings'

export const useGetServiceWorker = () => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      const nextRegistration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH)
      setRegistration(nextRegistration)

      try {
        nextRegistration?.update()
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }
    })()
  }, [])

  return {
    serviceWorker: registration?.active ?? registration?.installing
  }
}
