import { init } from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'

import 'rsuite/dist/rsuite.css'
import 'mini.css'
import 'nouislider/distribute/nouislider.css'
import './ui/assets/index.css'
import 'ol/ol.css'
import './ui/assets/App.css'
import './ui/shared/ol-override.css'
import './ui/shared/rsuite-override.css'
// eslint-disable-next-line import/no-relative-packages
// import '@mtes-mct/monitor-ui/assets/stylesheets/rsuite-override.css'

if (!(process.env.NODE_ENV === 'development')) {
  init({
    dsn: 'https://a5f3272efa794bb9ada2ffea90f2fec5@sentry.incubateur.net/8',
    integrations: [new BrowserTracing()],

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
  // <StrictMode>
  <App />
  // </StrictMode>
)
