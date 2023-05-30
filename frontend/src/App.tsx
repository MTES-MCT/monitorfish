import { OnlyFontGlobalStyle, THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import countries from 'i18n-iso-countries'
import { useEffect } from 'react'
import { hasAuthParams } from 'react-oidc-context'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { CustomProvider as RsuiteCustomProvider } from 'rsuite'
import rsuiteFrFr from 'rsuite/locales/fr_FR'

import { AuthorizationContext } from './context/AuthorizationContext'
import { NamespaceContext } from './context/NamespaceContext'
import { useIsSuperUser } from './hooks/useIsSuperUser'
import { BackofficePage } from './pages/BackofficePage'
import { HomePage } from './pages/HomePage'
import { LandingPage } from './pages/LandingPage'
import { UnsupportedBrowserPage } from './pages/UnsupportedBrowserPage'
import { backofficeStore, backofficeStorePersistor, mainStore, mainStorePersistor } from './store'
import { FrontendErrorBoundary } from './ui/FrontendErrorBoundary'
import { isBrowserSupported } from './utils/isBrowserSupported'

import type { AuthContextProps } from 'react-oidc-context'

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))

type AppProps = {
  auth?: AuthContextProps | undefined
}
export function App({ auth }: AppProps) {
  const isSuperUser = useIsSuperUser()

  useEffect(() => {
    if (!auth) {
      return
    }

    // automatically sign-in
    if (!hasAuthParams() && !auth?.isAuthenticated && !auth?.activeNavigator && !auth?.isLoading) {
      auth?.signinRedirect()
    }
  }, [auth, auth?.isAuthenticated, auth?.activeNavigator, auth?.isLoading, auth?.signinRedirect])

  if (auth && !auth.isAuthenticated) {
    return <LandingPage hasInsufficientRights />
  }

  if (!isBrowserSupported()) {
    return <UnsupportedBrowserPage />
  }

  if (isSuperUser === undefined) {
    return <LandingPage />
  }

  return (
    <ThemeProvider theme={THEME}>
      <OnlyFontGlobalStyle />

      <FrontendErrorBoundary>
        <AuthorizationContext.Provider value={isSuperUser}>
          <RsuiteCustomProvider locale={rsuiteFrFr}>
            <Router>
              <Switch>
                <Route path="/backoffice">
                  {!isSuperUser && <LandingPage />}
                  {isSuperUser && (
                    <Provider store={backofficeStore}>
                      {/* eslint-disable-next-line no-null/no-null */}
                      <PersistGate loading={null} persistor={backofficeStorePersistor}>
                        <NamespaceContext.Provider value="backoffice">
                          <BackofficePage />
                        </NamespaceContext.Provider>
                      </PersistGate>
                    </Provider>
                  )}
                </Route>
                <Route exact path="/ext">
                  {
                    /**
                     * Redirect to /ext when the user is not logged as a super user
                     */
                    !isSuperUser && <Redirect to="/" />
                  }
                </Route>
                <Route path="/">
                  <Provider store={mainStore}>
                    {/* eslint-disable-next-line no-null/no-null */}
                    <PersistGate loading={null} persistor={mainStorePersistor}>
                      <NamespaceContext.Provider value="homepage">
                        <HomePage />
                      </NamespaceContext.Provider>
                    </PersistGate>
                  </Provider>
                </Route>
              </Switch>
            </Router>
          </RsuiteCustomProvider>
        </AuthorizationContext.Provider>
      </FrontendErrorBoundary>
    </ThemeProvider>
  )
}
