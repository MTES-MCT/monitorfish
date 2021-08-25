import React from 'react'
import { BrowserRouter as Router, Route, Switch, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'
import { ToastProvider } from 'react-toast-notifications'
import { browserName, browserVersion } from 'react-device-detect'

import Map from './features/map/Map'
import Backoffice from './features/backoffice/Backoffice'
import VesselsSearchBox from './features/vessel_search/VesselsSearchBox'
import VesselSidebar from './features/vessel_sidebar/VesselSidebar'
import LayersSidebar from './features/layers/LayersSidebar'
import APIWorker from './api/APIWorker'
import VesselVisibility from './features/vessel_visibility/VesselVisibility'
import VesselList from './features/vessel_list/VesselList'
import UpdatingVesselLoader from './features/vessel_sidebar/UpdatingVesselLoader'
import RightMenuOnHoverArea from './features/vessel_sidebar/RightMenuOnHoverArea'
import Measurement from './features/measurements/Measurement'
import VesselFilters from './features/vessel_filters/VesselFilters'
import NewRegulation from './features/backoffice/create_regulation/NewRegulation'
import { ReactComponent as AlertSVG } from './features/icons/Picto_alerte.svg'
import { Provider } from 'react-redux'
import { backofficeStore, homeStore } from './Store'
import NamespaceContext from './domain/context/NamespaceContext'
import Healthcheck from './features/healthcheck/Healthcheck'
import InterestPoint from './features/interest_points/InterestPoint'

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
      <Healthcheck/>
      <Wrapper>
        <Map/>
        <LayersSidebar/>
        <VesselsSearchBox/>
        <RightMenuOnHoverArea/>
        <VesselList namespace={'homepage'}/>
        <VesselFilters/>
        <VesselVisibility/>
        <VesselSidebar/>
        <UpdatingVesselLoader/>
        <Measurement/>
        <InterestPoint/>
        <APIWorker/>
      </Wrapper>
    </NamespaceContext.Provider>
  </Provider>
}

function BackofficePage () {
  const match = useRouteMatch()
  return <Provider store={backofficeStore}>
    <NamespaceContext.Provider value={'backoffice'}>
    <Switch>
        <Route exact path={`${match.path}`}>
          <BackofficeWrapper>
          <Backoffice/>
        </BackofficeWrapper>
        </Route>
        <Route path={`${match.path}/newRegulation`}>
          <NewRegulation />
        </Route>
      </Switch>
    </NamespaceContext.Provider>
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
  height: 100% - 50px;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
`

const BackofficeWrapper = styled.div`
  font-size: 13px;
  text-align: center;
  height: 100%;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
`

export default App
