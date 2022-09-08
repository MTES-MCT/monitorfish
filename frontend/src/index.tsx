import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { FontStyle } from './ui/assets/fonts/fonts'

import 'rsuite/dist/rsuite.css'
import 'mini.css'
import 'nouislider/distribute/nouislider.css'
import './ui/assets/index.css'
import 'ol/ol.css'
import './ui/assets/App.css'
import './ui/shared/ol-override.css'
import './ui/shared/rsuite-override.css'

if (!(process.env.NODE_ENV === 'development')) {
  Sentry.init({
    dsn: 'https://a5f3272efa794bb9ada2ffea90f2fec5@sentry.incubateur.net/8',
    integrations: [
      new Integrations.BrowserTracing({
        tracingOrigins: ['monitorfish-test.csam.e2.rie.gouv.fr', 'monitorfish.din.developpement-durable.gouv.fr']
      })
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0
  })
}

const container = document.getElementById('root')
if (!container) {
  throw new Error('Cannot find container element with id #root.')
}
const root = createRoot(container)

root.render(
  <>
    <FontStyle />
    <App />
  </>
)
