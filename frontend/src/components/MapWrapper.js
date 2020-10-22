import React, {useContext, useEffect, useRef, useState} from 'react';

import Map from 'ol/Map'
import View from 'ol/View'
import VectorTileLayer from 'ol/layer/Tile'
import {OSM} from 'ol/source';
import {transform} from 'ol/proj'
import {toStringHDMS, toStringXY} from 'ol/coordinate';
import {defaults as defaultControls} from 'ol/control';
import {Context} from "../state/Store";
import EEZControl from "./EEZControl";
import LayersEnum from "../layers/LayersEnum";
import FAOControl from "./FAOControl";
import MapBottomBox from "./MapBottomBox";

const OL_MAP_PROJECTION = 'EPSG:3857';

const MapWrapper = () => {
  const [state, dispatch] = useContext(Context)
  const [map, setMap] = useState()
  const [cursorCoordinates , setCursorCoordinates] = useState()

  const mapElement = useRef()
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
    initialMap.on('pointermove', handlePointerMove)

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

  const handleMapClick = event => {
    const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, feature => {
      return feature;
    });

    if (feature) {
      console.log("Clicked on feature", feature.getId())
    }
  }

  function showPointerIfShipFeature(feature) {
    if (feature && feature.getId().includes(LayersEnum.SHIPS)) {
      mapRef.current.getTarget().style.cursor = 'pointer'
    } else {
      mapRef.current.getTarget().style.cursor = ''
    }
  }

  function showCoordinatesInDMS(event) {
    const clickedCoordinates = mapRef.current.getCoordinateFromPixel(event.pixel);
    const transformedCoordinates = transform(clickedCoordinates, OL_MAP_PROJECTION, 'EPSG:4326')
    setCursorCoordinates(toStringHDMS(transformedCoordinates))
  }

  const handlePointerMove = event => {
    const pixel = mapRef.current.getEventPixel(event.originalEvent);
    const feature = mapRef.current.forEachFeatureAtPixel(pixel, feature => {
      return feature;
    });

    showPointerIfShipFeature(feature);
    showCoordinatesInDMS(event);
  }

  return (
      <div>
        <div ref={mapElement} className="map-container"/>
        <EEZControl />
        <FAOControl />
        <MapBottomBox coordinates={cursorCoordinates} />

      </div>
  )
}

export default MapWrapper
