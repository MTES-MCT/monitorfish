import { CustomGlobalStyle } from '@components/CustomGlobalStyle'
import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { useGetUserAuthorization } from '@hooks/authorization/useGetUserAuthorization'
import { GlobalStyle, THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { LandingPage } from '@pages/LandingPage'
import { UnsupportedBrowserPage } from '@pages/UnsupportedBrowserPage'
import { isBrowserSupported } from '@utils/isBrowserSupported'
import countries from 'i18n-iso-countries'
import COUNTRIES_FR from 'i18n-iso-countries/langs/fr.json'
import { useCallback, useEffect, useMemo } from 'react'
import { hasAuthParams } from 'react-oidc-context'
import { RouterProvider } from 'react-router-dom'
import { CustomProvider as RsuiteCustomProvider } from 'rsuite'
import rsuiteFrFr from 'rsuite/locales/fr_FR'

import { UserAccountContext } from './context/UserAccountContext'
import { router } from './router'

import type { AuthContextProps } from 'react-oidc-context'

countries.registerLocale(COUNTRIES_FR)

type AppProps = Readonly<{
  auth?: AuthContextProps | undefined
}>
export function App({ auth }: AppProps) {
  const userAuthorization = useGetUserAuthorization()

  const logout = useCallback(() => {
    const idTokenHint = auth?.user?.id_token

    auth?.removeUser()
    auth?.removeUser()
    auth?.signoutRedirect({ id_token_hint: idTokenHint ?? '' })
  }, [auth])

  const userAccount = useMemo(
    () => ({
      email: auth?.user?.profile?.email,
      isSuperUser: userAuthorization?.isSuperUser ?? false,
      logout
    }),
    [logout, userAuthorization, auth?.user?.profile?.email]
  )

  useEffect(() => {
    if (!auth) {
      return
    }

    // automatically sign-in
    if (!hasAuthParams() && !auth?.isAuthenticated && !auth?.activeNavigator && !auth?.isLoading) {
      // eslint-disable-next-line no-console
      console.log('Redirect after Cerbère sign-in.')
      auth?.signinRedirect()
    }
  }, [auth, auth?.isAuthenticated, auth?.activeNavigator, auth?.isLoading, auth?.signinRedirect])

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
          <UserAccountContext.Provider value={userAccount}>
            <RouterProvider router={router} />
          </UserAccountContext.Provider>
        </FrontendErrorBoundary>
      </RsuiteCustomProvider>
    </ThemeProvider>
  )
}
