import { BrowserTracing } from '@sentry/browser'
import { init } from '@sentry/react'
import { createRoot } from 'react-dom/client'
import { AuthProvider, withAuth } from 'react-oidc-context'

import { App } from './App'
import 'rsuite/dist/rsuite.min.css'
import 'nouislider/dist/nouislider.css'
import './ui/assets/index.css'
import 'ol/ol.css'
import './ui/assets/App.css'
import './ui/shared/ol-override.css'
/**
 * TODO Step-by-step migration to full CSS-in-JS (= no local CSS stylesheets):
 * 1. Remove duplicated CSS from local rsuite-override.css
 * 2. Either replace legacy components with monitor-ui ones
 *    or integrate leftover local overrides into local components styled definitions.
 * 3. Delete local rsuite-override.css (and <NoRsuiteOverrideWrapper />).
 * 4. Migrate monitor-ui rsuite-override.css rules into components styled definitions.
 * 5. Delete monitor-ui rsuite-override.css.
 * 6. Move App.css rules into styled definitions.
 * 7. Delete App.css.
 */
import '@mtes-mct/monitor-ui/assets/stylesheets/rsuite-override.css'
import './ui/shared/rsuite-override.css'
import { getOIDCConfig } from './auth/getOIDCConfig'

if (import.meta.env.PROD) {
  // https://docs.sentry.io/platforms/javascript/performance/#configure-the-sample-rate
  init({
    dsn: import.meta.env.FRONTEND_SENTRY_DSN || '',
    environment: import.meta.env.FRONTEND_SENTRY_ENV || '',
    integrations: [
      new BrowserTracing({
        tracingOrigins: import.meta.env.FRONTEND_SENTRY_TRACING_ORIGINS
          ? [import.meta.env.FRONTEND_SENTRY_TRACING_ORIGINS || '']
          : []
      })
    ],
    release: import.meta.env.FRONTEND_MONITORFISH_VERSION || '',
    tracesSampleRate: 1.0
  })
}

const container = document.getElementById('root')
if (!container) {
  throw new Error('Cannot find container element with id #root.')
}
const root = createRoot(container)

const { IS_OIDC_ENABLED, oidcConfig } = getOIDCConfig()

if (IS_OIDC_ENABLED) {
  const AppWithAuth = withAuth(App)

  root.render(
    // eslint-disable-next-line react/jsx-props-no-spreading
    <AuthProvider {...oidcConfig}>
      <AppWithAuth />
    </AuthProvider>
  )
} else {
  root.render(<App />)
}
