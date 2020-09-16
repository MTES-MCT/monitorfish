// react
import React, { useState, useEffect, useRef } from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import Feature from 'ol/Feature';
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {OSM} from 'ol/source';
import Point from 'ol/geom/Point';
import {Icon, Style} from 'ol/style';
import {transform} from 'ol/proj'
import {toStringXY} from 'ol/coordinate';

function MapWrapper(props) {

  // set intial state
  const [ map, setMap ] = useState()
  const [ featuresLayer, setFeaturesLayer ] = useState()
  const [ selectedCoord , setSelectedCoord ] = useState()

  // pull refs
  const mapElement = useRef()
  
  // create state ref that can be accessed in OpenLayers onclick callback function
  //  https://stackoverflow.com/a/60643670
  const mapRef = useRef()
  mapRef.current = map

  useEffect( () => {
    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource()
    })

    // create map
    const centeredOnFrance = [2.99049, 46.82801];
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(), // We use Open Street Map
        }),
        initalFeaturesLayer
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: transform(centeredOnFrance, 'EPSG:4326', 'EPSG:3857'),
        zoom: 6
      }),
      controls: []
    })

    // set map onclick handler
    initialMap.on('click', handleMapClick)

    // save map and vector layer references to state
    setMap(initialMap)
    setFeaturesLayer(initalFeaturesLayer)
  },[])

  // update map if features prop changes - logic formerly put into componentDidUpdate
  useEffect( () => {
    if (props.features.length) { // may be null on first render
      let features = props.features.map(feature => {
        // transform coord to EPSG 4326 standard Lat Long
        const transformedCoordinates = transform([feature.lon, feature.lat], 'EPSG:4326', 'EPSG:3857')
        
        const iconFeature = new Feature({
          geometry: new Point(transformedCoordinates),
          name: feature.name,
        });

        const iconStyle = new Style({
          image: new Icon({
            src: 'sprite_medium.webp',
            offset: [0, 0],
            imgSize: [20, 20],
            rotation: feature.cog
          }),
        });
        
        iconFeature.setStyle(iconStyle);

        return iconFeature;
      })
      
      // set features to map
      featuresLayer.setSource(
        new VectorSource({
          features: features
        })
      )

      // fit map to feature extent (with 100px of padding)
      //map.getView().fit(featuresLayer.getSource().getExtent(), {
      //  padding: [100,100,100,100]
      //})

    }

  },[props.features, featuresLayer, map])

  // map click handler
  const handleMapClick = (event) => {
    // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
    //  https://stackoverflow.com/a/60643670
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);

    // transform coord to EPSG 4326 standard Lat Long
    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

    // set React state
    setSelectedCoord(transormedCoord)
  }

  // render component
  return (      
    <div>
      <div ref={mapElement} className="map-container"></div>
      
      <div className="clicked-coord-label">
        <p>{ (selectedCoord) ? toStringXY(selectedCoord, 5) : '' }</p>
      </div>

    </div>
  )
}

export default MapWrapper