import React, {useContext, useEffect, useRef, useState} from 'react';

import Map from 'ol/Map'
import View from 'ol/View'
import VectorTileLayer from 'ol/layer/Tile'
import {OSM} from 'ol/source';
import {transform} from 'ol/proj'
import {toStringXY} from 'ol/coordinate';
import {defaults as defaultControls} from 'ol/control';
import {Context} from "../state/Store";
import EEZControl from "./EEZControl";
import LayersEnum from "../layers/LayersEnum";

const OL_MAP_PROJECTION = 'EPSG:3857';

const MapWrapper = () => {
  const [state, dispatch] = useContext(Context)
  const [map, setMap] = useState()
  const [selectedCoord , setSelectedCoord] = useState()

  // pull refs
  const mapElement = useRef()

  // create state ref that can be accessed in OpenLayers onclick callback function
  //  https://stackoverflow.com/a/60643670
  const mapRef = useRef()
  mapRef.current = map

  useEffect( () => {
    const OSMLayer = new VectorTileLayer({
      source: new OSM({
        attributions: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
      }),
    })

    const centeredOnFrance = [2.99049, 46.82801];
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        OSMLayer
      ],
      renderer: (['webgl', 'canvas']),
      view: new View({
        projection: OL_MAP_PROJECTION,
        center: transform(centeredOnFrance, 'EPSG:4326', OL_MAP_PROJECTION),
        zoom: 6,
        minZoom: 5
      }),
      controls: defaultControls({
        attributionOptions: {
          collapsible: true
        }
      }),
    })

    // set map onclick handler
    initialMap.on('click', handleMapClick)

    setMap(initialMap)
  },[])

  useEffect( () => {
    if(map && state.layers.length && state.layerToShow) {
      state.layers
          .filter(layer => {
            return layer.className_ === state.layerToShow
          })
          .forEach(layer => {
            if(map.getLayers().getLength() === 1) {
              map.getLayers().push(layer);
              dispatch({type: 'RESET_SHOW_LAYER'});
              return
            }

            if(layer.className_ === LayersEnum.SHIPS) {
              map.getLayers().pop();
              map.getLayers().push(layer);
              dispatch({type: 'RESET_SHOW_LAYER'});
              return
            }

            let index = map.getLayers().getLength() - 1
            map.getLayers().insertAt(index, layer);
            dispatch({type: 'RESET_SHOW_LAYER'});
          })
    }
  },[state.layers, state.layerToShow, map])

  useEffect( () => {
    if(map && state.layers.length && state.layerToHide) {
      state.layers
          .filter(layer => {
            return layer.className_ === state.layerToHide
          })
          .forEach((layer, index) => {
            map.getLayers().remove(layer);
            dispatch({type: 'RESET_HIDE_LAYER'});
          })
    }
  },[state.layers, state.layerToHide, map])

  // map click handler
  const handleMapClick = (event) => {
    // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
    //  https://stackoverflow.com/a/60643670
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);

    // transform coord to EPSG 4326 standard Lat Long
    const transormedCoord = transform(clickedCoord, OL_MAP_PROJECTION, 'EPSG:4326')

    // set React state
    setSelectedCoord(transormedCoord)
  }

  // render component
  return (
      <div>
        <div ref={mapElement} className="map-container"/>
        <EEZControl />

        <div className="clicked-coord-label">
          <p>{ (selectedCoord) ? toStringXY(selectedCoord, 5) : '' }</p>
        </div>

      </div>
  )
}

export default MapWrapper
