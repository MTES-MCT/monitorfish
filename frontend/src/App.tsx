import { CustomGlobalStyle } from '@components/CustomGlobalStyle'
import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { useMatomo } from '@hooks/useMatomo'
import { GlobalStyle, THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { UnsupportedBrowserPage } from '@pages/UnsupportedBrowserPage'
import { isBrowserSupported } from '@utils/isBrowserSupported'
import countries from 'i18n-iso-countries'
import COUNTRIES_FR from 'i18n-iso-countries/langs/fr.json'
import { useSyncExternalStore } from 'react'
import { RouterProvider } from 'react-router-dom'
import { CustomProvider as RsuiteCustomProvider } from 'rsuite'
import frFR from 'rsuite/locales/fr_FR'

import { ROUTER_PATHS } from './paths'
import { router } from './router'

countries.registerLocale(COUNTRIES_FR)

export function App() {
  useMatomo()

  if (!isBrowserSupported()) {
    return <UnsupportedBrowserPage />
  }

  return (
    <ThemeProvider theme={THEME}>
      <AppGlobalStyle />

      <RsuiteCustomProvider locale={frFR}>
        <FrontendErrorBoundary>
          <RouterProvider router={router} />
        </FrontendErrorBoundary>
      </RsuiteCustomProvider>
    </ThemeProvider>
  )
}

// The login page is styled by the DSFR, which these app-wide resets (e.g. `* { font-size: 13px }`) would break
function AppGlobalStyle() {
  const pathname = useSyncExternalStore(router.subscribe, () => router.state.location.pathname)

  if (pathname === ROUTER_PATHS.login) {
    return null
  }

  return (
    <>
      <GlobalStyle />
      <CustomGlobalStyle />
    </>
  )
}
