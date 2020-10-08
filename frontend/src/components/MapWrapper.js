// react
import React, { useState, useEffect, useRef } from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import Feature from 'ol/Feature';
import VectorTileLayer from 'ol/layer/Tile'
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

    const OSMLayer = new VectorTileLayer({
      source: new OSM({
        attributions: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
      }),
    })

    // create map
    const centeredOnFrance = [2.99049, 46.82801];
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        OSMLayer,
        initalFeaturesLayer
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: transform(centeredOnFrance, 'EPSG:4326', 'EPSG:3857'),
        zoom: 6,
        minZoom: 5
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
    console.log(props.features.length)
    if (props.features.length) {
      let features = props.features.map(feature => {
        // transform coord to EPSG 4326 standard Lat Long
        const transformedCoordinates = transform([feature.longitude, feature.latitude], 'EPSG:4326', 'EPSG:3857')
        
        const iconFeature = new Feature({
          geometry: new Point(transformedCoordinates),
          name: feature.mmsi || feature.internalReferenceNumber,
        });

        const featureDate = new Date(feature.dateTime);
        const nowMinusTwoHours = new Date();
        nowMinusTwoHours.setHours(nowMinusTwoHours.getHours() - 3);

        const iconStyle = new Style({
          image: new Icon({
            src: 'boat.png',
            offset: [0, 0],
            imgSize: [20, 20],
            rotation: feature.course,
            opacity: featureDate < nowMinusTwoHours ? 0.5 : 1
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
