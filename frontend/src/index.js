import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import GlobalFonts from './fonts/fonts'

import 'mini.css'
import 'nouislider/distribute/nouislider.css'
import 'rsuite/dist/rsuite.css'
import './index.css'
import 'ol/ol.css'
import './App.css'

if (!(process.env.NODE_ENV === 'development')) {
  Sentry.init({
    dsn: 'https://a5f3272efa794bb9ada2ffea90f2fec5@sentry.incubateur.net/8',
    integrations: [
      new Integrations.BrowserTracing({
        tracingOrigins: ['monitorfish-test.csam.e2.rie.gouv.fr', 'monitorfish.din.developpement-durable.gouv.fr'],
      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  })
}

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <>
    <GlobalFonts />
    <App />
  </>,
)
