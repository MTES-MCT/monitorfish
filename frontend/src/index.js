import React from 'react'
import ReactDOM from 'react-dom'
import 'rsuite/dist/styles/rsuite-default.css'
import 'mini.css'
import 'nouislider/distribute/nouislider.css'
import './index.css'
import 'ol/ol.css'
import './App.css'

import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'

import App from './App'
import { Provider } from 'react-redux'
import Store from './Store'
import GlobalFonts from './fonts/fonts'

Sentry.init({
  dsn: 'https://ab46041e2f104a45b73260f1d19879b0@o557126.ingest.sentry.io/5688987',
  integrations: [new Integrations.BrowserTracing({
    tracingOrigins: ['monitorfish-test.csam.e2.rie.gouv.fr', 'monitorfish.din.developpement-durable.gouv.fr']
  })],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

ReactDOM.render(
  <React.StrictMode>
      <Provider store={Store}>
          <GlobalFonts/>
          <App />
      </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
