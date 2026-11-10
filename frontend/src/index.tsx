import { init } from '@sentry/react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { getLightModeRedirection } from './features/LightMode/utils'
import { getSentryOptions } from './libs/getSentryOptions'

import 'rsuite/dist/rsuite.min.css'
import 'ol/ol.css'
import '@mtes-mct/monitor-ui/assets/stylesheets/rsuite-override.css'

// Users who enabled the light mode (slow connections) land on it, before loading anything else
const lightModeRedirection = getLightModeRedirection(window.location.pathname, window.location.hash)
if (lightModeRedirection) {
  window.location.replace(lightModeRedirection)
} else {
  startApp()
}

function startApp() {
  if (import.meta.env.FRONTEND_SENTRY_DSN && import.meta.env.FRONTEND_SENTRY_TRACING_ORIGINS) {
    init(
      getSentryOptions({
        dsn: import.meta.env.FRONTEND_SENTRY_DSN,
        environment: import.meta.env.FRONTEND_SENTRY_ENV ?? 'development',
        pathname: window.location.pathname,
        release: import.meta.env.FRONTEND_MONITORFISH_VERSION ?? 'v0.0.0',
        tracingOrigins: import.meta.env.FRONTEND_SENTRY_TRACING_ORIGINS
      })
    )
  }

  const container = document.getElementById('root')
  if (!container) {
    throw new Error('Cannot find container element with id #root.')
  }
  const root = createRoot(container)

  root.render(<App />)
}
