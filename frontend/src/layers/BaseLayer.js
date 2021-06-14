import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { MapboxVector } from 'ol/layer'
import Layers from '../domain/entities/layers'
import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'
import XYZ from 'ol/source/XYZ'
import TileWMS from 'ol/source/TileWMS'

const BaseLayer = ({ map }) => {
  const selectedBaseLayer = useSelector(state => state.map.selectedBaseLayer)

  const [baseLayersObjects] = useState({
    OSM: new TileLayer({
      source: new OSM({
        attributions: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
      }),
      className: Layers.BASE_LAYER.code,
      zIndex: 0
    }),
    SATELLITE: new TileLayer({
      source: new XYZ({
        url: 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg90?access_token=' + process.env.REACT_APP_MAPBOX_KEY,
        maxZoom: 19
      }),
      className: Layers.BASE_LAYER.code,
      zIndex: 0
    }),
    LIGHT: new MapboxVector({
      styleUrl: 'mapbox://styles/mapbox/light-v10',
      accessToken: process.env.REACT_APP_MAPBOX_KEY,
      className: Layers.BASE_LAYER.code,
      zIndex: 0
    }),
    DARK: new MapboxVector({
      styleUrl: 'mapbox://styles/monitorfish/cklv7vc0f1ej817o5ivmkjmrs',
      accessToken: process.env.REACT_APP_MAPBOX_KEY,
      className: Layers.BASE_LAYER.code,
      zIndex: 0
    }),
    SHOM: new TileLayer({
      source: new TileWMS({
        url: `https://services.data.shom.fr/${process.env.REACT_APP_SHOM_KEY}/wms/r`,
        params: {'LAYERS': 'RASTER_MARINE_3857_WMSR', 'TILED': true},
        serverType: 'geoserver',
        // Countries have transparency, so do not fade tiles:
        transition: 0,
      }),
    className: Layers.BASE_LAYER.code,
    zIndex: 0
    }),
  })

  useEffect(() => {
    addLayerToMap()
  }, [map])

  useEffect(() => {
    showAnotherBaseLayer()
  }, [selectedBaseLayer])

  function addLayerToMap () {
    if (map && selectedBaseLayer && baseLayersObjects[selectedBaseLayer]) {
      map.getLayers().push(baseLayersObjects[selectedBaseLayer])
    }
  }

  function showAnotherBaseLayer () {
    if (map && selectedBaseLayer && baseLayersObjects[selectedBaseLayer]) {
      const layerToRemove = map.getLayers().getArray()
        .find(layer => layer.className_ === Layers.BASE_LAYER.code)

      if (!layerToRemove) {
        return
      }

      map.getLayers().insertAt(0, baseLayersObjects[selectedBaseLayer])
      setTimeout(() => {
        map.getLayers().remove(layerToRemove)
      }, 300)
    }
  }

  return null
}

export default BaseLayer
