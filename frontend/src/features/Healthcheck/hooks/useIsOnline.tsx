import { useEffect, useState } from 'react'

export function useIsOnline() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  useEffect(() => {
    const setOffline = () => setIsOnline(false)
    const setOnline = () => setIsOnline(true)
    window.addEventListener('offline', setOffline)
    window.addEventListener('online', setOnline)

    return () => {
      window.removeEventListener('offline', setOffline)
      window.removeEventListener('online', setOnline)
    }
  }, [])

  return isOnline
}
