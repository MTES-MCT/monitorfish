import './App.css';

// react
import React, { useState, useEffect } from 'react';

// components
import MapWrapper from './components/MapWrapper'

function App() {
  
  // set intial state
  const [ features, setFeatures ] = useState([])

  // initialization - retrieve mock boat coordinates
  useEffect( () => {

    fetch('http://localhost:8880/api/v1/positions')
      .then(response => response.json())
      .then(fetchedFeatures => {
        setFeatures(fetchedFeatures)
      })

  },[])
  
  return (
    <div className="App">
      
      <div className="app-label">
        <img src="monitorfish.png" alt='MonirorFish'/>
      </div>
      
      <MapWrapper features={features} />

    </div>
  )
}

export default App
