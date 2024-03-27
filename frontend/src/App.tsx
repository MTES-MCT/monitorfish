import { CustomGlobalStyle } from '@components/CustomGlobalStyle'
import { useGetUserAuthorization } from '@hooks/authorization/useGetUserAuthorization'
import { GlobalStyle, THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { LandingPage } from '@pages/LandingPage'
import { UnsupportedBrowserPage } from '@pages/UnsupportedBrowserPage'
import { isBrowserSupported } from '@utils/isBrowserSupported'
import countries from 'i18n-iso-countries'
import COUNTRIES_FR from 'i18n-iso-countries/langs/fr.json'
import { useEffect } from 'react'
import { hasAuthParams } from 'react-oidc-context'
import { RouterProvider } from 'react-router-dom'
import { CustomProvider as RsuiteCustomProvider } from 'rsuite'
import rsuiteFrFr from 'rsuite/locales/fr_FR'

import { AuthorizationContext } from './context/AuthorizationContext'
import { router } from './router'
import { FrontendErrorBoundary } from './ui/FrontendErrorBoundary'

import type { AuthContextProps } from 'react-oidc-context'

countries.registerLocale(COUNTRIES_FR)

type AppProps = {
  auth?: AuthContextProps | undefined
}
export function App({ auth }: AppProps) {
  const userAuthorization = useGetUserAuthorization()

  useEffect(() => {
    if (!auth) {
      return
    }

    // automatically sign-in
    if (!hasAuthParams() && !auth?.isAuthenticated && !auth?.activeNavigator && !auth?.isLoading) {
      // eslint-disable-next-line no-console
      console.log('Redirect after Cerbère sign-in.')
      auth?.signinRedirect()

      return
    }

    if (!auth.isLoading && auth?.isAuthenticated && userAuthorization?.isLogged === false) {
      // eslint-disable-next-line no-console
      console.log('Authenticated.')
      // eslint-disable-next-line no-restricted-globals
      location.reload()
    }
  }, [
    auth,
    auth?.isAuthenticated,
    auth?.activeNavigator,
    auth?.isLoading,
    auth?.signinRedirect,
    userAuthorization?.isLogged
  ])

  if (auth && !auth.isLoading && auth.isAuthenticated && userAuthorization?.isLogged === false) {
    return <LandingPage />
  }

  if (auth && !auth.isLoading && !auth.isAuthenticated) {
    return <LandingPage hasInsufficientRights />
  }

  if (!isBrowserSupported()) {
    return <UnsupportedBrowserPage />
  }

  if (userAuthorization === undefined) {
    return <LandingPage />
  }

  return (
    <ThemeProvider theme={THEME}>
      <GlobalStyle />
      <CustomGlobalStyle />

      <RsuiteCustomProvider locale={rsuiteFrFr}>
        <FrontendErrorBoundary>
          <AuthorizationContext.Provider value={userAuthorization.isSuperUser}>
            <RouterProvider router={router} />
          </AuthorizationContext.Provider>
        </FrontendErrorBoundary>
      </RsuiteCustomProvider>
      {/* This script is used to inject the chat */}
      <script src="https://embed.small.chat/T0176BBUCEQC01SV3W4464.js" async/>
    </ThemeProvider>
  )
}
