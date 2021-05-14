import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import styled from 'styled-components'
import { ToastProvider } from 'react-toast-notifications'
import Map from './containers/Map'
import VesselsSearchBox from './containers/VesselsSearchBox'
import VesselSidebar from './containers/VesselSidebar'
import LayersSidebar from './containers/LayersSidebar'
import APIWorker from './api/APIWorker'
import VesselVisibility from './containers/VesselVisibility'
import VesselList from './containers/VesselList'
import UpdatingVesselLoader from './containers/UpdatingVesselLoader'
import RightMenuOnHoverZone from './containers/RightMenuOnHoverZone'
import Measurement from './containers/Measurement'

function App () {
  return (
    <>
      <ToastProvider placement="bottom-right">
<<<<<<< HEAD
        <Router>
          <Switch>
            <Route path='/'>
              <Wrapper>
                <Map/>
                <VesselsSearchBox/>
                <RightMenuOnHoverZone />
                <LayersSidebar/>
                <VesselList/>
                <VesselVisibility/>
                <VesselSidebar/>
                <UpdatingVesselLoader/>
                <Measurement/>
                <APIWorker/>
              </Wrapper>
            </Route>
            <Route path='/backoffice'>
              <BackofficeMap/>
            </Route>
          </Switch>
        </Router>
=======
      <Router>
      <Switch>
          <Route path="/backoffice">
            <Backoffice />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
>>>>>>> add router for backoffice
      </ToastProvider>
    </>
  )
}

function Home () {
  return <Wrapper>
    <Map />
    <LayersSidebar/>
    <VesselsSearchBox />
    <RightMenuOnHoverZone />
    <VesselList/>
    <VesselVisibility/>
    <VesselSidebar/>
    <UpdatingVesselLoader/>
    <Measurement/>
    <APIWorker/>
  </Wrapper>
}

function Backoffice () {
  return <BackofficeWrapper>
    <Map isBackOffice/>
    <LayersSidebar/>
    <APIWorker/>
  </BackofficeWrapper>
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
