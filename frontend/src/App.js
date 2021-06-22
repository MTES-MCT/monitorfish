import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import { ToastProvider } from 'react-toast-notifications'
import { browserName, browserVersion } from 'react-device-detect'

import Map from './containers/Map'
import Backoffice from './containers/Backoffice'
import VesselsSearchBox from './containers/VesselsSearchBox'
import VesselSidebar from './containers/VesselSidebar'
import LayersSidebar from './containers/LayersSidebar'
import APIWorker from './api/APIWorker'
import VesselVisibility from './containers/VesselVisibility'
import VesselList from './containers/VesselList'
import UpdatingVesselLoader from './containers/UpdatingVesselLoader'
import RightMenuOnHoverZone from './containers/RightMenuOnHoverZone'
import Measurement from './containers/Measurement'
import VesselFilters from './containers/VesselFilters'
import { ReactComponent as AlertSVG } from './components/icons/Picto_alerte.svg'
import { Provider } from 'react-redux'
import { homeStore, backofficeStore } from './Store'
import NamespaceContext from './domain/context/NamespaceContext'

function App () {
  switch (browserName) {
    case 'Internet Explorer': return getUnsupportedBrowser()
    case 'Edge': if (browserVersion < 79) return getUnsupportedBrowser(); break
    case 'Chrome': if (browserVersion < 69) return getUnsupportedBrowser(); break
    case 'Firefox': if (browserVersion < 62) return getUnsupportedBrowser(); break
    case 'Safari': if (browserVersion < 12) return getUnsupportedBrowser(); break
    case 'Opera': if (browserVersion < 56) return getUnsupportedBrowser(); break
  }

  return (
    <>
      <ToastProvider placement="bottom-right">
      <Router>
      <Switch>
          <Route path="/backoffice">
            <BackofficePage />
          </Route>
          <Route path="/">
            <HomePage />
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
    <Wrapper>
      <Map />
      <LayersSidebar/>
      <VesselsSearchBox />
      <RightMenuOnHoverZone />
      <VesselList/>
      <VesselFilters/>
      <VesselVisibility/>
      <VesselSidebar/>
      <UpdatingVesselLoader/>
      <Measurement/>
      <APIWorker/>
    </Wrapper>
    </NamespaceContext.Provider>
    </Provider>
}

function BackofficePage () {
  return <Provider store={backofficeStore}>
    <NamespaceContext.Provider value={'backoffice'}>
      <BackofficeWrapper>
        <Backoffice />
      </BackofficeWrapper>
    </NamespaceContext.Provider>
  </Provider>
}

function getUnsupportedBrowser () {
  return <Wrapper>
    <Alert>
      <AlertSVG /><br/>
      <Text>
        <Title>Cette version de votre navigateur est trop ancienne, MonitorFish ne peut pas fonctionner correctement.</Title><br/>
        Merci d&apos;utiliser une version de Firefox supérieure à la version 62, ou une version de Chrome supérieure à la version 69.
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
  height: 100%;
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
