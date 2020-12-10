import 'ol/ol.css';
import './App.css';
import 'mini.css';

import React from 'react';
import styled from "styled-components";
import { ToastProvider } from 'react-toast-notifications'
import MapWrapper from './containers/MapWrapper'
import VesselsSearchBox from "./containers/VesselsSearchBox";
import VesselSidebar from "./containers/VesselSidebar";
import LeftSidebar from "./containers/LeftSidebar";
import APIWorker from "./api/APIWorker";

function App() {
  return (
      <>
          <ToastProvider placement="bottom-right">
              <Wrapper>
              <Header>
                <Logo>
                  <img src="monitorfish.png" style={{width: 40, height: 40}} alt='MonitorFish'/>
                </Logo>
                <VesselsSearchBox/>
              </Header>
              <MapWrapper />
              <LeftSidebar />
              <VesselSidebar />

              <APIWorker />
            </Wrapper>
          </ToastProvider>
      </>
  )
}

const Wrapper = styled.div`
  text-align: center;
  height: 100%;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
`

const Header = styled.div`
  position: absolute;
  top: 0;
  height: 49px;
  width: 100%;
  background-color: #05055E;
  z-index: 666666;
  border-bottom: 1px solid rgb(255,255,255,0.2);
`

const Logo = styled.div`
  width: auto;
  overflow: auto;
  margin: 5px;
  position: absolute;
  z-index: 2;
  pointer-events: none;
`

export default App
