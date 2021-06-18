import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import styled from 'styled-components'
import { ToastProvider } from 'react-toast-notifications'
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
import { Provider } from 'react-redux'
import { homeStore, backofficeStore } from './Store'
import NamespaceContext from './domain/context/NamespaceContext'

function App () {
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
