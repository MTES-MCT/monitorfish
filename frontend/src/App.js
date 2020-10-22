import 'ol/ol.css';
import './App.css';

import React from 'react';

import MapWrapper from './components/MapWrapper'
import Store from "./state/Store";
import ShipsLayer from "./layers/ShipsLayer";
import EEZLayer from "./layers/EEZLayer";
import FAOLayer from "./layers/FAOLayer";

function App() {
  return (
      <Store>
        <div className="App">
          <div className="app-label">
            <img src="monitorfish.png" alt='MonitorFish'/>
          </div>
          <MapWrapper />
          <ShipsLayer />
          <EEZLayer />
          <FAOLayer />
        </div>
      </Store>
  )
}

export default App
