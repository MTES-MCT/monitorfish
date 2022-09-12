import countries from 'i18n-iso-countries'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import styled, { ThemeProvider } from 'styled-components'

import APIWorker from './api/APIWorker'
import { BackofficeMode } from './api/BackofficeMode'
import NamespaceContext from './domain/context/NamespaceContext'
import { ErrorToastNotification } from './features/commonComponents/ErrorToastNotification'
import FavoriteVessels from './features/favorite_vessels/FavoriteVessels'
import Healthcheck from './features/healthcheck/Healthcheck'
import InterestPoint from './features/interest_points/InterestPoint'
import LayersSidebar from './features/layers/LayersSidebar'
import Map from './features/map/Map'
import Measurement from './features/measurements/Measurement'
import PreviewFilteredVessels from './features/preview_filtered_vessels/PreviewFilteredVessels'
import AlertsMapButton from './features/side_window/alerts_reportings/AlertsMapButton'
import BeaconMalfunctionsMapButton from './features/side_window/beacon_malfunctions/BeaconMalfunctionsMapButton'
import SideWindow from './features/side_window/SideWindow'
import SideWindowLauncher from './features/side_window/SideWindowLauncher'
import VesselFilters from './features/vessel_filters/VesselFilters'
import VesselLabels from './features/vessel_labels/VesselLabels'
import VesselList from './features/vessel_list/VesselList'
import VesselsSearch from './features/vessel_search/VesselsSearch'
import RightMenuOnHoverArea from './features/vessel_sidebar/RightMenuOnHoverArea'
import UpdatingVesselLoader from './features/vessel_sidebar/UpdatingVesselLoader'
import { VesselSidebar } from './features/vessel_sidebar/VesselSidebar'
import VesselVisibility from './features/vessel_visibility/VesselVisibility'
import { useAppSelector } from './hooks/useAppSelector'
import { BackofficePage } from './pages/BackofficePage'
import { UiPage } from './pages/UiPage'
import { UnsupportedBrowserPage } from './pages/UnsupportedBrowserPage'
import { backofficeStore, homeStore, backofficePersistor } from './store'
import { theme } from './ui/theme'
import { isBrowserSupported } from './utils/isBrowserSupported'

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))

export function App() {
  if (!isBrowserSupported()) {
    return <UnsupportedBrowserPage />
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route path="/backoffice">
            <Provider store={backofficeStore}>
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

          <Route exact path="/ui">
            <NamespaceContext.Provider value="ui">
              <UiPage />
            </NamespaceContext.Provider>
          </Route>

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
  const isVesselSidebarOpen = useAppSelector(state => state.vessel.vesselSidebarIsOpen)
  const ref = useRef()

  return (
    <>
      <BackofficeMode isAdmin />
      <Switch>
        <Route exact path="/side_window">
          <SideWindow
            ref={ref}
            // @ts-ignore
            isFromURL
          />
        </Route>
        <Route exact path="/">
          <Healthcheck />
          <PreviewFilteredVessels />
          <Wrapper>
            <Map />
            <LayersSidebar />
            <VesselsSearch />
            <AlertsMapButton />
            <BeaconMalfunctionsMapButton />
            <RightMenuOnHoverArea />
            <VesselList namespace="homepage" />
            <VesselFilters />
            <VesselVisibility />
            <FavoriteVessels />
            {isVesselSidebarOpen && <VesselSidebar />}
            <UpdatingVesselLoader />
            <Measurement />
            <InterestPoint />
            <VesselLabels />
            <APIWorker />
            <ErrorToastNotification />
            <SideWindowLauncher />
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
        <VesselFilters />
        <VesselVisibility />
        <FavoriteVessels />
        {isVesselSidebarOpen && <VesselSidebar />}
        <UpdatingVesselLoader />
        <Measurement />
        <InterestPoint />
        <VesselLabels />
        <APIWorker />
        <ErrorToastNotification />
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div`
  font-size: 13px;
  text-align: center;
  width: 100vw;
  overflow: hidden;
`
