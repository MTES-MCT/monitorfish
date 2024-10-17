import { CustomGlobalStyle } from '@components/CustomGlobalStyle'
import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { GlobalStyle, THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { UnsupportedBrowserPage } from '@pages/UnsupportedBrowserPage'
import { isBrowserSupported } from '@utils/isBrowserSupported'
import countries from 'i18n-iso-countries'
import COUNTRIES_FR from 'i18n-iso-countries/langs/fr.json'
import { RouterProvider } from 'react-router-dom'
import { CustomProvider as RsuiteCustomProvider } from 'rsuite'
import rsuiteFrFr from 'rsuite/locales/fr_FR'

import { router } from './router'

countries.registerLocale(COUNTRIES_FR)

export function App() {
  if (!isBrowserSupported()) {
    return <UnsupportedBrowserPage />
  }

  return (
    <ThemeProvider theme={THEME}>
      <GlobalStyle />
      <CustomGlobalStyle />

      <RsuiteCustomProvider locale={rsuiteFrFr}>
        <FrontendErrorBoundary>
          <RouterProvider router={router} />
        </FrontendErrorBoundary>
      </RsuiteCustomProvider>
    </ThemeProvider>
  )
}
