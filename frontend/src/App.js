import React from 'react'
import { BrowserRouter as Router, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'
import { ToastProvider } from 'react-toast-notifications'
import { browserName, browserVersion } from 'react-device-detect'
import { PersistGate } from 'redux-persist/integration/react'

import Map from './features/map/Map'
import Backoffice from './features/backoffice/Backoffice'
import VesselsSearch from './features/vessel_search/VesselsSearch'
import VesselSidebar from './features/vessel_sidebar/VesselSidebar'
import LayersSidebar from './features/layers/LayersSidebar'
import APIWorker from './api/APIWorker'
import VesselVisibility from './features/vessel_visibility/VesselVisibility'
import VesselList from './features/vessel_list/VesselList'
import UpdatingVesselLoader from './features/vessel_sidebar/UpdatingVesselLoader'
import RightMenuOnHoverArea from './features/vessel_sidebar/RightMenuOnHoverArea'
import Measurement from './features/measurements/Measurement'
import VesselFilters from './features/vessel_filters/VesselFilters'
import EditRegulation from './features/backoffice/edit_regulation/EditRegulation'
import { ReactComponent as AlertSVG } from './features/icons/Picto_alerte.svg'
import { Provider } from 'react-redux'
import { backofficeStore, homeStore, backofficePersistor } from './Store'
import NamespaceContext from './domain/context/NamespaceContext'
import Healthcheck from './features/healthcheck/Healthcheck'
import InterestPoint from './features/interest_points/InterestPoint'
import VesselLabels from './features/vessel_labels/VesselLabels'
import PreviewFilteredVessels from './features/preview_filtered_vessels/PreviewFilteredVessels'
import ErrorToastNotification from './features/commonComponents/ErrorToastNotification'
import Menu from './features/backoffice/menu/Menu'
import ControlObjectives from './features/backoffice/control_objectives/ControlObjectives'
import StateManager from './api/BackofficeMode'
import AlertsMapButton from './features/side_window/alerts/AlertsMapButton'
import BeaconMalfunctionsMapButton from './features/side_window/beacon_malfunctions/BeaconMalfunctionsMapButton'
import SideWindowLauncher from './features/side_window/SideWindowLauncher'
import SideWindow from './features/side_window/SideWindow'
import { sideWindowMenu } from './domain/entities/sideWindow'
import FavoriteVessels from './features/favorite_vessels/FavoriteVessels'
import FleetSegments from './features/backoffice/fleet_segments/FleetSegments'

function App () {
  switch (browserName) {
    case 'Internet Explorer':
      return getUnsupportedBrowser()
    case 'Edge':
      if (browserVersion < 79) return getUnsupportedBrowser()
      break
    case 'Chrome':
      if (browserVersion < 69) return getUnsupportedBrowser()
      break
    case 'Firefox':
      if (browserVersion < 62) return getUnsupportedBrowser()
      break
    case 'Safari':
      if (browserVersion < 12) return getUnsupportedBrowser()
      break
    case 'Opera':
      if (browserVersion < 56) return getUnsupportedBrowser()
      break
  }

  return (
    <>
      <ToastProvider placement="bottom-right">
        <Router>
          <Switch>
            <Route path="/backoffice">
              <BackofficePage/>
            </Route>
            <Route exact path="/ext">
              <TritonFish/>
            </Route>
            <Route path="/">
              <HomePage/>
            </Route>
          </Switch>
        </Router>
      </ToastProvider>
    </>
  )
}

function HomePage () {
  return <Provider store={homeStore}>
      <NamespaceContext.Provider value={'homepage'}>
        <StateManager
          inBackofficeMode={false}
          adminRole={true}
        />
        <Switch>
          <Route exact path="/side_window">
            <SideWindow
              openedSideWindowTab={sideWindowMenu.ALERTS.code}
              fromTab
            />
          </Route>
          <Route exact path="/">
            <Healthcheck/>
            <PreviewFilteredVessels/>
            <Wrapper>
              <Map/>
              <LayersSidebar/>
              <VesselsSearch/>
              <AlertsMapButton/>
              <BeaconMalfunctionsMapButton/>
              <RightMenuOnHoverArea/>
              <VesselList namespace={'homepage'}/>
              <VesselFilters/>
              <VesselVisibility/>
              <FavoriteVessels/>
              <VesselSidebar/>
              <UpdatingVesselLoader/>
              <Measurement/>
              <InterestPoint/>
              <VesselLabels/>
              <APIWorker/>
              <ErrorToastNotification/>
              <SideWindowLauncher/>
            </Wrapper>
          </Route>
        </Switch>
      </NamespaceContext.Provider>
  </Provider>
}

function TritonFish () {
  return <Provider store={homeStore}>
    <NamespaceContext.Provider value={'homepage'}>
      <StateManager
        inBackofficeMode={false}
        adminRole={false}
      />
      <Healthcheck/>
      <PreviewFilteredVessels/>
      <Wrapper>
        <Map/>
        <LayersSidebar/>
        <VesselsSearch/>
        <RightMenuOnHoverArea/>
        <VesselList namespace={'homepage'}/>
        <VesselFilters/>
        <VesselVisibility/>
        <FavoriteVessels/>
        <VesselSidebar/>
        <UpdatingVesselLoader/>
        <Measurement/>
        <InterestPoint/>
        <VesselLabels/>
        <APIWorker/>
        <ErrorToastNotification/>
      </Wrapper>
    </NamespaceContext.Provider>
  </Provider>
}

function BackofficePage () {
  const match = useRouteMatch()

  return <Provider store={backofficeStore}>
    <PersistGate loading={null} persistor={backofficePersistor}>
      <NamespaceContext.Provider value={'backoffice'}>
        <StateManager inBackofficeMode={true}/>
        <BackofficeWrapper>
          <Menu/>
          <Switch>
            <Route
              exact
              path="/backoffice"
              render={() => <Redirect to="/backoffice/regulation"/>}
            />
            <Route exact path={`${match.path}/regulation`}>
              <Backoffice/>
            </Route>
            <Route exact path={`${match.path}/regulation/new`}>
              <EditRegulation title='Saisir une nouvelle réglementation' />
            </Route>
            <Route exact path={`${match.path}/regulation/edit`}>
              <EditRegulation title='Modifier la réglementation de la zone' isEdition={true}/>
            </Route>
            <Route exact path={`${match.path}/control_objectives`}>
              <ControlObjectives/>
            </Route>
            <Route exact path={`${match.path}/fleet_segments`}>
              <FleetSegments/>
            </Route>
          </Switch>
        </BackofficeWrapper>
        <ErrorToastNotification/>
      </NamespaceContext.Provider>
    </PersistGate>
  </Provider>
}

function getUnsupportedBrowser () {
  return <Wrapper>
    <Alert>
      <AlertSVG/><br/>
      <Text>
        <Title>Cette version de votre navigateur est trop ancienne, MonitorFish ne peut pas fonctionner
          correctement.</Title><br/>
        Merci d&apos;utiliser une version de Firefox supérieure à la version 62, ou une version de Chrome supérieure à
        la version 69.
      </Text>
    </Alert>
  </Wrapper>
}

const Text = styled.span`
  width: 700px;
  display: inline-block;
`

const Title = styled.span`
  margin-top: 20px;
  margin-bottom: 15px;
  display: inline-block;
  font: normal normal bold 28px/31px Marianne;
`

const Alert = styled.div`
  text-align: center;
  font: normal normal medium 22px/31px Marianne;
  letter-spacing: 0px;
  color: #05065F;
  background: #CAD2D3 0% 0% no-repeat padding-box;
  height: 100vh;
  width: 100vw;
  padding-top: 35vh;
`

const Wrapper = styled.div`
  font-size: 13px;
  text-align: center;
  width: 100vw;
  overflow: hidden;
`

const BackofficeWrapper = styled.div`
  font-size: 13px;
  text-align: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
`

export default App
