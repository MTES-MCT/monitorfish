import { GlobalStyle, THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import countries from 'i18n-iso-countries'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import styled, { createGlobalStyle } from 'styled-components'

import APIWorker from './api/APIWorker'
import { BackofficeMode } from './api/BackofficeMode'
import NamespaceContext from './domain/context/NamespaceContext'
import { ErrorToastNotification } from './features/commonComponents/ErrorToastNotification'
import FavoriteVessels from './features/favorite_vessels/FavoriteVessels'
import Healthcheck from './features/healthcheck/Healthcheck'
import LayersSidebar from './features/layers/LayersSidebar'
import { DrawLayerModal } from './features/map/draw/DrawModal'
import Map from './features/map/Map'
import { InterestPointMapButton } from './features/map/tools/interest_points/InterestPointMapButton'
import { MeasurementMapButton } from './features/map/tools/measurements/MeasurementMapButton'
import { RightMenuOnHoverArea } from './features/map/tools/RightMenuOnHoverArea'
import { VesselFiltersMapButton } from './features/map/tools/vessel_filters/VesselFiltersMapButton'
import { VesselLabelsMapButton } from './features/map/tools/vessel_labels/VesselLabelsMapButton'
import { VesselVisibilityMapButton } from './features/map/tools/vessel_visibility/VesselVisibilityMapButton'
import PreviewFilteredVessels from './features/preview_filtered_vessels/PreviewFilteredVessels'
import { SideWindow } from './features/SideWindow'
import { AlertsMapButton } from './features/SideWindow/alerts_reportings/AlertsMapButton'
import { BeaconMalfunctionsMapButton } from './features/SideWindow/beacon_malfunctions/BeaconMalfunctionsMapButton'
import { SideWindowLauncher } from './features/SideWindow/SideWindowLauncher'
import { VesselList } from './features/vessel_list/VesselList'
import { VesselsSearch } from './features/vessel_search/VesselsSearch'
import UpdatingVesselLoader from './features/vessel_sidebar/UpdatingVesselLoader'
import { VesselSidebar } from './features/vessel_sidebar/VesselSidebar'
import { useAppSelector } from './hooks/useAppSelector'
import { BackofficePage } from './pages/BackofficePage'
import { TestPage } from './pages/TestPage'
import { UnsupportedBrowserPage } from './pages/UnsupportedBrowserPage'
import { backofficeStore, homeStore, backofficePersistor } from './store'
import { isBrowserSupported } from './utils/isBrowserSupported'

import type { MutableRefObject } from 'react'

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))

export function App() {
  if (!isBrowserSupported()) {
    return <UnsupportedBrowserPage />
  }

  return (
    <ThemeProvider theme={THEME}>
      <GlobalStyle />
      <CustomGlobalStyle />

      <Router>
        <Switch>
          <Route path="/backoffice">
            <Provider store={backofficeStore}>
              {/* eslint-disable-next-line no-null/no-null */}
              <PersistGate loading={null} persistor={backofficePersistor}>
                <NamespaceContext.Provider value="backoffice">
                  <BackofficePage />
                </NamespaceContext.Provider>
              </PersistGate>
            </Provider>
          </Route>

          <Route exact path="/ext">
            <Provider store={homeStore}>
              <NamespaceContext.Provider value="homepage">
                <TritonFish />
              </NamespaceContext.Provider>
            </Provider>
          </Route>

          <Route component={TestPage} exact path="/test" />

          <Route path="/">
            <Provider store={homeStore}>
              <NamespaceContext.Provider value="homepage">
                <HomePage />
              </NamespaceContext.Provider>
            </Provider>
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  )
}

function HomePage() {
  const {
    isDrawLayerModalDisplayed,
    isInterestPointMapButtonDisplayed,
    isMeasurementMapButtonDisplayed,
    isVesselFiltersMapButtonDisplayed,
    isVesselLabelsMapButtonDisplayed,
    isVesselListDisplayed,
    isVesselSearchDisplayed,
    isVesselVisibilityMapButtonDisplayed
  } = useAppSelector(state => state.displayedComponent)
  const isVesselSidebarOpen = useAppSelector(state => state.vessel.vesselSidebarIsOpen)
  const openedSideWindowTab = useAppSelector(state => state.global.openedSideWindowTab)
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
            {isVesselSearchDisplayed && <VesselsSearch />}
            <AlertsMapButton />
            <BeaconMalfunctionsMapButton />
            <RightMenuOnHoverArea />
            {isVesselListDisplayed && <VesselList namespace="homepage" />}
            {isVesselFiltersMapButtonDisplayed && <VesselFiltersMapButton />}
            {isVesselVisibilityMapButtonDisplayed && <VesselVisibilityMapButton />}
            <FavoriteVessels />
            {isVesselSidebarOpen && <VesselSidebar />}
            <UpdatingVesselLoader />
            {isMeasurementMapButtonDisplayed && <MeasurementMapButton />}
            {isInterestPointMapButtonDisplayed && <InterestPointMapButton />}
            {isVesselLabelsMapButtonDisplayed && <VesselLabelsMapButton />}
            <APIWorker />
            <ErrorToastNotification />
            {openedSideWindowTab && <SideWindowLauncher />}
            {isDrawLayerModalDisplayed && <DrawLayerModal />}
          </Wrapper>
        </Route>
      </Switch>
    </>
  )
}

function TritonFish() {
  const isVesselSidebarOpen = useAppSelector(state => state.vessel.vesselSidebarIsOpen)

  return (
    <>
      <BackofficeMode />
      <Healthcheck />
      <PreviewFilteredVessels />
      <Wrapper>
        <Map />
        <LayersSidebar />
        <VesselsSearch />
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

const CustomGlobalStyle = createGlobalStyle`
  html, body {
    font-size: 13px;
  }
`

const Wrapper = styled.div`
  font-size: 13px;
  overflow: hidden;
  text-align: center;
  width: 100vw;
`
