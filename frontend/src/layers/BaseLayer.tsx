import { MapboxVector } from 'ol/layer'
import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'
import TileWMS from 'ol/source/TileWMS'
import XYZ from 'ol/source/XYZ'
import React, { useEffect, useState } from 'react'

import { BaseLayers, Layer } from '../domain/entities/layers/constants'
import { useAppSelector } from '../hooks/useAppSelector'

export type BaseLayerProps = {
  map?: any
}
function UnmemoizedBaseLayer({ map }: BaseLayerProps) {
  const selectedBaseLayer = useAppSelector(state => state.map.selectedBaseLayer)

  const [baseLayersObjects] = useState({
    LIGHT: () =>
      new MapboxVector({
        accessToken: process.env.REACT_APP_MAPBOX_KEY,
        className: Layer.BASE_LAYER.code,
        styleUrl: 'mapbox://styles/monitorfish/ckrbusml50wgv17nrzy3q374b',
        zIndex: 0
      }),
    OSM: () =>
      new TileLayer({
        className: Layer.BASE_LAYER.code,
        source: new OSM({
          attributions:
            '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
        }),
        zIndex: 0
      }),
    SATELLITE: () =>
      new TileLayer({
        className: Layer.BASE_LAYER.code,
        source: new XYZ({
          maxZoom: 19,
          url: `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg90?access_token=${process.env.REACT_APP_MAPBOX_KEY}`
        }),
        zIndex: 0
      }),
    SHOM: () =>
      new TileLayer({
        className: Layer.BASE_LAYER.code,
        source: new TileWMS({
          params: { LAYERS: 'RASTER_MARINE_3857_WMSR', TILED: true },
          serverType: 'geoserver',
          // Countries have transparency, so do not fade tiles:
          transition: 0,

          url: `https://services.data.shom.fr/${process.env.REACT_APP_SHOM_KEY}/wms/r`
        }),
        zIndex: 0
      })
  })

  useEffect(() => {
    if (!map) {
      return
    }

    function addLayerToMap() {
      const nextSelectedBaseLayer = selectedBaseLayer || BaseLayers.OSM.code

      if (baseLayersObjects[nextSelectedBaseLayer]) {
        map.getLayers().push(baseLayersObjects[nextSelectedBaseLayer]())
      }
    }

    addLayerToMap()
  }, [map, baseLayersObjects, selectedBaseLayer])

  useEffect(() => {
    if (!map || !selectedBaseLayer || !baseLayersObjects[selectedBaseLayer]) {
      return
    }

    function showAnotherBaseLayer() {
      const olLayers = map.getLayers()
      // eslint-disable-next-line no-underscore-dangle
      const layerToRemove = olLayers.getArray().find(layer => layer.className_ === Layer.BASE_LAYER.code)

      if (!layerToRemove) {
        return
      }

      olLayers.insertAt(0, baseLayersObjects[selectedBaseLayer]())
      setTimeout(() => {
        olLayers.remove(layerToRemove)
      }, 300)
    }

    showAnotherBaseLayer()
  }, [baseLayersObjects, map, selectedBaseLayer])

  return <></>
}

export const BaseLayer = React.memo(UnmemoizedBaseLayer)

BaseLayer.displayName = 'BaseLayer'
