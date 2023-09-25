import { useEffect } from 'react'

import { HomePage } from './HomePage'
import { NavigationContext } from '../context/NavigationContext'
import { registerServiceWorker } from '../workers/registerServiceWorker'

export function NavHomePage() {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <NavigationContext.Provider value>
      <HomePage />
    </NavigationContext.Provider>
  )
}
