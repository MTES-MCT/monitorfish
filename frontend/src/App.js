import React from 'react'
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
import Measure from './containers/Measure'

function App () {
  return (
    <>
      <ToastProvider placement="bottom-right">
        <Wrapper>
          <Map/>
          <VesselsSearchBox/>
          <RightMenuOnHoverZone />
          <LayersSidebar/>
          <VesselList/>
          <VesselVisibility/>
          <VesselSidebar/>
          <UpdatingVesselLoader/>
          <Measure/>

          <APIWorker/>
        </Wrapper>
      </ToastProvider>
    </>
  )
}

const Wrapper = styled.div`
  font-size: 13px;
  text-align: center;
  height: 100%;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
`

export default App
