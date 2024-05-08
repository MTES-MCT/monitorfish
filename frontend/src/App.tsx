import { CustomGlobalStyle } from '@components/CustomGlobalStyle'
import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { GlobalStyle, THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { LandingPage } from '@pages/LandingPage'
import { UnsupportedBrowserPage } from '@pages/UnsupportedBrowserPage'
import { isBrowserSupported } from '@utils/isBrowserSupported'
import { UserAccountContext } from 'context/UserAccountContext'
import countries from 'i18n-iso-countries'
import COUNTRIES_FR from 'i18n-iso-countries/langs/fr.json'
import { RouterProvider } from 'react-router-dom'
import { CustomProvider as RsuiteCustomProvider } from 'rsuite'
import rsuiteFrFr from 'rsuite/locales/fr_FR'

import { useCustomAuth } from './auth/hooks/useCustomAuth'
import { router } from './router'

countries.registerLocale(COUNTRIES_FR)

export function App() {
  const { isAuthorized, isLoading, userAccount } = useCustomAuth()

  if (isLoading) {
    return <LandingPage />
  }

  if (!isAuthorized || !userAccount) {
    return <LandingPage hasInsufficientRights />
  }

  if (!isBrowserSupported()) {
    return <UnsupportedBrowserPage />
  }

  return (
    <UserAccountContext.Provider value={userAccount}>
      <ThemeProvider theme={THEME}>
        <GlobalStyle />
        <CustomGlobalStyle />

        <RsuiteCustomProvider locale={rsuiteFrFr}>
          <FrontendErrorBoundary>
            <RouterProvider router={router} />
          </FrontendErrorBoundary>
        </RsuiteCustomProvider>
      </ThemeProvider>
    </UserAccountContext.Provider>
  )
}
