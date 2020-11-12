import 'ol/ol.css';
import './App.css';

import React from 'react';
import styled from "styled-components";

import MapWrapper from './components/MapWrapper'
import Store from "./Store";
import VesselsLayer from "./layers/VesselsLayer";
import EEZLayer from "./layers/EEZLayer";
import FAOLayer from "./layers/FAOLayer";
import Cron from "./api/Cron";
import ThreeMilesLayer from "./layers/ThreeMilesLayer";
import OneHundredMilesLayer from "./layers/OneHundredMilesLayer";
import SixMilesLayer from "./layers/SixMilesLayer";
import TwelveMilesLayer from "./layers/TwelveMilesLayer";
import CoastLinesLayer from "./layers/CoastLinesLayer";
import RegulatoryLayer from "./layers/RegulatoryLayer";
import VesselsSearchBox from "./components/VesselsSearchBox";

function App() {
  return (
      <Store>
        <Wrapper>
          <Header>
            <Logo>
              <img src="monitorfish.png" style={{width: 40, height: 40}} alt='MonitorFish'/>
            </Logo>
            <VesselsSearchBox/>
          </Header>
          <MapWrapper />

          <VesselsLayer />
          <EEZLayer />
          <FAOLayer />
          <ThreeMilesLayer />
          <SixMilesLayer />
          <TwelveMilesLayer />
          <OneHundredMilesLayer />
          <CoastLinesLayer />
          <RegulatoryLayer />

          <Cron />
        </Wrapper>
      </Store>
  )
}

const Wrapper = styled.div`
  text-align: center;
  height: 100%;
  width: 100%;
`

const Header = styled.div`
  position: absolute;
  top: 0;
  height: 50px;
  width: 100%;
  background-color: #05055E;
  z-index: 666666;
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
