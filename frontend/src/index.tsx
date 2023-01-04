import { GlobalStyle, THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { init } from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import countries from 'i18n-iso-countries'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { CustomProvider as RsuiteCustomProvider } from 'rsuite'
import rsuiteFrFr from 'rsuite/locales/fr_FR'
import { createGlobalStyle } from 'styled-components'

import { Backoffice } from './features/backoffice/Backoffice'
import ControlObjectives from './features/backoffice/control_objectives/ControlObjectives'
import { EditRegulation } from './features/backoffice/edit_regulation/EditRegulation'
import { FleetSegments } from './features/backoffice/fleet_segments/FleetSegments'
import { SideWindow } from './features/SideWindow'
import { BackofficePage } from './pages/BackofficePage'
import { HomePage } from './pages/HomePage'
import { MainWindow } from './pages/HomePage/MainWindow'
import { TestPage } from './pages/TestPage'
import { TritonFishPage } from './pages/TritonFishPage'

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

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))

/* eslint-disable sort-keys-fix/sort-keys-fix */
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    children: [
      {
        index: true,
        element: <MainWindow />
      },
      {
        path: 'side_window',
        element: <SideWindow isFromURL />
      }
    ]
  },
  {
    path: '/backoffice',
    element: <BackofficePage />,
    children: [
      {
        index: true,
        element: <Backoffice />
      },
      {
        path: 'regulation',
        element: <Backoffice />
      },
      {
        path: 'regulation/new',
        element: <EditRegulation isEdition={false} title="Saisir une nouvelle réglementation" />
      },
      {
        path: 'regulation/edit',
        element: <EditRegulation isEdition title="Modifier la réglementation de la zone" />
      },
      {
        path: 'control_objectives',
        element: <ControlObjectives />
      },
      {
        path: 'fleet_segments',
        element: <FleetSegments />
      }
    ]
  },
  {
    path: '/ext',
    element: <TritonFishPage />
  },
  {
    path: '/test',
    element: <TestPage />
  }
])
/* eslint-enable sort-keys-fix/sort-keys-fix */

const CustomGlobalStyle = createGlobalStyle`
  html, body {
    font-size: 13px;
  }
`

const container = document.getElementById('root')
if (!container) {
  throw new Error('Cannot find container element with id #root.')
}
const root = createRoot(container)

root.render(
  <StrictMode>
    <ThemeProvider theme={THEME}>
      <GlobalStyle />
      <CustomGlobalStyle />

      <RsuiteCustomProvider locale={rsuiteFrFr}>
        <RouterProvider router={router} />
      </RsuiteCustomProvider>
    </ThemeProvider>
  </StrictMode>
)
