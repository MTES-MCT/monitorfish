import { useState } from 'react'

export function useIsOnline() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  window.addEventListener('offline', () => setIsOnline(false))

  window.addEventListener('online', () => setIsOnline(true))

  return isOnline
}
