import { useEffect } from 'react'

import { HomePage } from './HomePage'
import { LightContext } from '../context/LightContext'
import { registerServiceWorker } from '../workers/registerServiceWorker'

export function LightHomePage() {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <LightContext.Provider value>
      <HomePage />
    </LightContext.Provider>
  )
}
