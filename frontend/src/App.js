import 'ol/ol.css';
import './App.css';
import 'mini.css';

import React from 'react';
import styled from "styled-components";
import { ToastProvider } from 'react-toast-notifications'
import MapWrapper from './containers/MapWrapper'
import VesselsSearchBox from "./containers/VesselsSearchBox";
import VesselSidebar from "./containers/VesselSidebar";
import LayersSidebar from "./containers/LayersSidebar";
import APIWorker from "./api/APIWorker";
import VesselVisibility from "./containers/VesselVisibility";

function App() {
  return (
      <>
          <ToastProvider placement="bottom-right">
              <Wrapper>
                  <Logo>
                      <img src="monitorfish.png" style={{width: 30, height: 30}} alt='MonitorFish'/>
                  </Logo>
                  <VesselsSearchBox/>
                  <MapWrapper />
                  <LayersSidebar />
                  <VesselVisibility />
                  <VesselSidebar />

                  <APIWorker />
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

const Logo = styled.div`
  width: auto;
  overflow: auto;
  bottom: 5px;
  right: 10px;
  position: absolute;
  z-index: 2;
  pointer-events: none;
`

export default App
