import './App.css';

// react
import React, { useState, useEffect } from 'react';

// components
import MapWrapper from './components/MapWrapper'

function App() {
  
  const [features, setFeatures] = useState([])

  useEffect(() => {
    getShips()
    setInterval(() => {
      getShips()
    }, 30000)
  },[])

  function getShips() {
    fetch('/bff/v1/positions')
        .then(response => response.json())
        .then(fetchedFeatures => {
          setFeatures(fetchedFeatures)
        })
  }
  
  return (
    <div className="App">
      <div className="app-label">
        <img src="monitorfish.png" alt='MonitorFish'/>
      </div>
      <MapWrapper features={features} />
    </div>
  )
}

export default App
