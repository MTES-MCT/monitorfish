import { OnlyFontGlobalStyle, THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import countries from 'i18n-iso-countries'
import { useEffect, useRef } from 'react'
import { hasAuthParams } from 'react-oidc-context'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { CustomProvider as RsuiteCustomProvider } from 'rsuite'
import rsuiteFrFr from 'rsuite/locales/fr_FR'
import styled from 'styled-components'

import { APIWorker } from './api/APIWorker'
import { BackofficeMode } from './api/BackofficeMode'
import { AuthorizationContext } from './context/AuthorizationContext'
import { NamespaceContext } from './context/NamespaceContext'
import { SideWindowStatus } from './domain/entities/sideWindow/constants'
import { ErrorToastNotification } from './features/commonComponents/ErrorToastNotification'
import { Healthcheck } from './features/Healthcheck'
import { DrawLayerModal } from './features/map/draw/DrawModal'
import Map from './features/map/Map'
import { MapButtons } from './features/MapButtons'
import { FavoriteVessels } from './features/MapButtons/FavoriteVessels'
import { InterestPointMapButton } from './features/MapButtons/InterestPoints'
import { LayersSidebar } from './features/MapButtons/LayersSidebar'
import { MeasurementMapButton } from './features/MapButtons/Measurements'
import { RightMenuOnHoverArea } from './features/MapButtons/shared/RightMenuOnHoverArea'
import { VesselFiltersMapButton } from './features/MapButtons/VesselFilters'
import { VesselLabelsMapButton } from './features/MapButtons/VesselLabels'
import { VesselVisibilityMapButton } from './features/MapButtons/VesselVisibility'
import PreviewFilteredVessels from './features/preview_filtered_vessels/PreviewFilteredVessels'
import { SideWindow } from './features/SideWindow'
import { SideWindowLauncher } from './features/SideWindow/SideWindowLauncher'
import { VesselList } from './features/VesselList'
import { VesselSidebar } from './features/VesselSidebar'
import UpdatingVesselLoader from './features/VesselSidebar/UpdatingVesselLoader'
import { VesselSidebarHeader } from './features/VesselSidebar/VesselSidebarHeader'
import { useIsSuperUser } from './hooks/useIsSuperUser'
import { useMainAppSelector } from './hooks/useMainAppSelector'
import { BackofficePage } from './pages/BackofficePage'
import { UnsupportedBrowserPage } from './pages/UnsupportedBrowserPage'
import { backofficeStore, backofficeStorePersistor, mainStore, mainStorePersistor } from './store'
import { FrontendErrorBoundary } from './ui/FrontendErrorBoundary'
import { isBrowserSupported } from './utils/isBrowserSupported'

import type { MutableRefObject } from 'react'
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
    return <div>Unable to log in</div>
  }

  if (!isBrowserSupported()) {
    return <UnsupportedBrowserPage />
  }

  if (isSuperUser === undefined) {
    return <>Logging...</>
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
                  {
                    /**
                     * Redirect to /ext when the user is not logged as a super user
                     */
                    !isSuperUser && <Redirect to="/ext" />
                  }
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
                  <Provider store={mainStore}>
                    <NamespaceContext.Provider value="homepage">
                      <TritonFish />
                    </NamespaceContext.Provider>
                  </Provider>
                </Route>
                <Route path="/">
                  {
                    /**
                     * Redirect to /ext when the user is not logged as a super user
                     */
                    !isSuperUser && <Redirect to="/ext" />
                  }
                  {isSuperUser && (
                    <Provider store={mainStore}>
                      {/* eslint-disable-next-line no-null/no-null */}
                      <PersistGate loading={null} persistor={mainStorePersistor}>
                        <NamespaceContext.Provider value="homepage">
                          <HomePage />
                        </NamespaceContext.Provider>
                      </PersistGate>
                    </Provider>
                  )}
                </Route>
              </Switch>
            </Router>
          </RsuiteCustomProvider>
        </AuthorizationContext.Provider>
      </FrontendErrorBoundary>
    </ThemeProvider>
  )
}

function HomePage() {
  const { isDrawLayerModalDisplayed, isVesselListDisplayed, isVesselSearchDisplayed } = useMainAppSelector(
    state => state.displayedComponent
  )
  const isVesselSidebarOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)
  const { sideWindow } = useMainAppSelector(state => state)
  const ref = useRef() as MutableRefObject<HTMLDivElement>

  return (
    <>
      <BackofficeMode isAdmin />
      <Switch>
        <Route exact path="/side_window">
          <SideWindow ref={ref} isFromURL />
        </Route>
        <Route exact path="/">
          <Healthcheck />
          <PreviewFilteredVessels />
          <Wrapper>
            <Map />
            <LayersSidebar />
            {isVesselSearchDisplayed && <VesselSidebarHeader />}
            <MapButtons />
            <RightMenuOnHoverArea />
            {isVesselListDisplayed && <VesselList namespace="homepage" />}
            {isVesselSidebarOpen && <VesselSidebar />}
            <UpdatingVesselLoader />
            <APIWorker />
            <ErrorToastNotification />
            {sideWindow.status !== SideWindowStatus.CLOSED && <SideWindowLauncher />}
            {isDrawLayerModalDisplayed && <DrawLayerModal />}
          </Wrapper>
        </Route>
      </Switch>
    </>
  )
}

function TritonFish() {
  const isVesselSidebarOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)

  return (
    <>
      <BackofficeMode />
      <Healthcheck />
      <PreviewFilteredVessels />
      <Wrapper>
        <Map />
        <LayersSidebar />
        <VesselSidebarHeader />
        <RightMenuOnHoverArea />
        <VesselList namespace="homepage" />
        <VesselFiltersMapButton />
        <VesselVisibilityMapButton />
        <FavoriteVessels />
        {isVesselSidebarOpen && <VesselSidebar />}
        <UpdatingVesselLoader />
        <MeasurementMapButton />
        <InterestPointMapButton />
        <VesselLabelsMapButton />
        <APIWorker />
        <ErrorToastNotification />
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div`
  font-size: 13px;
  overflow: hidden;
  text-align: center;
  width: 100vw;
`
