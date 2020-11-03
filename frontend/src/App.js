import 'ol/ol.css';
import './App.css';

import React from 'react';

import MapWrapper from './components/MapWrapper'
import Store from "./Store";
import ShipsLayer from "./layers/ShipsLayer";
import EEZLayer from "./layers/EEZLayer";
import FAOLayer from "./layers/FAOLayer";
import Cron from "./api/Cron";
import ThreeMilesLayer from "./layers/ThreeMilesLayer";
import OneHundredMilesLayer from "./layers/OneHundredMilesLayer";
import SixMilesLayer from "./layers/SixMilesLayer";
import TwelveMilesLayer from "./layers/TwelveMilesLayer";
import CoastLinesLayer from "./layers/CoastLinesLayer";

function App() {
  return (
      <Store>
        <div className="App">
          <div className="app-label">
            <img src="monitorfish.png" style={{width: 40, height: 40}} alt='MonitorFish'/>
          </div>
          <MapWrapper />

          <ShipsLayer />
          <EEZLayer />
          <FAOLayer />
          <ThreeMilesLayer />
          <SixMilesLayer />
          <TwelveMilesLayer />
          <OneHundredMilesLayer />
          <CoastLinesLayer />

          <Cron />
        </div>
      </Store>
  )
}

export default App
