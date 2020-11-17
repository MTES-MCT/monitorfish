import 'ol/ol.css';
import './App.css';
import 'mini.css';

import React from 'react';
import styled from "styled-components";
import { ToastProvider } from 'react-toast-notifications'
import MapWrapper from './components/MapWrapper'
import Store from "./Store";
import VesselsLayer from "./layers/VesselsLayer";
import EEZLayer from "./layers/EEZLayer";
import FAOLayer from "./layers/FAOLayer";
import APIWorker from "./api/APIWorker";
import ThreeMilesLayer from "./layers/ThreeMilesLayer";
import OneHundredMilesLayer from "./layers/OneHundredMilesLayer";
import SixMilesLayer from "./layers/SixMilesLayer";
import TwelveMilesLayer from "./layers/TwelveMilesLayer";
import CoastLinesLayer from "./layers/CoastLinesLayer";
import RegulatoryLayer from "./layers/RegulatoryLayer";
import VesselsSearchBox from "./components/VesselsSearchBox";
import VesselBox from "./components/VesselBox";
import ZoneLayerSelectionBox from "./components/ZoneLayerSelectionBox";
import Layers from "./domain/layers";
import RegulatoryLayerSelectionBox from "./components/RegulatoryLayerSelectionBox";

function App() {
  return (
      <Store>
          <ToastProvider placement="bottom-right">
        <Wrapper>
          <Header>
            <Logo>
              <img src="monitorfish.png" style={{width: 40, height: 40}} alt='MonitorFish'/>
            </Logo>
            <VesselsSearchBox/>
          </Header>
          <MapWrapper />
          <ZoneLayerSelectionBox
              layers={[
                { layer: Layers.EEZ, layerName: 'ZEE' },
                { layer: Layers.FAO, layerName: 'FAO' },
                { layer: Layers.THREE_MILES, layerName: '3 Milles' },
                { layer: Layers.SIX_MILES, layerName: '6 Milles' },
                { layer: Layers.TWELVE_MILES, layerName: '12 Milles' },
                { layer: Layers.ONE_HUNDRED_MILES, layerName: '100 Milles' },
                { layer: Layers.COAST_LINES, layerName: 'Trait de côte' }
              ]}/>
          <RegulatoryLayerSelectionBox />
          <VesselBox />

          <VesselsLayer />
          <EEZLayer />
          <FAOLayer />
          <ThreeMilesLayer />
          <SixMilesLayer />
          <TwelveMilesLayer />
          <OneHundredMilesLayer />
          <CoastLinesLayer />
          <RegulatoryLayer />

          <APIWorker />
        </Wrapper>
          </ToastProvider>
      </Store>
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
