import { MapboxVector } from 'ol/layer'
import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'
import TileWMS from 'ol/source/TileWMS'
import XYZ from 'ol/source/XYZ'
import React, { useEffect, useState } from 'react'

import { Layer } from '../domain/entities/layers/constants'
import { useAppSelector } from '../hooks/useAppSelector'

export type BaseLayerProps = {
  map?: any
}
function UnmemoizedBaseLayer({ map }: BaseLayerProps) {
  let selectedBaseLayer = useAppSelector(state => state.map.selectedBaseLayer)

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

    SCAN_LITTORAL: () =>
      new TileLayer({
        className: Layer.BASE_LAYER.code,
        source: new TileWMS({
          params: { LAYERS: 'FDC_GEBCO_PYR-PNG_3857_WMTS', TILED: true },
          serverType: 'geoserver',
          // Countries have transparency, so do not fade tiles:
          transition: 0,

          url: `https://services.data.shom.fr/${process.env.REACT_APP_SHOM_KEY}/wms/r`
        }),
        zIndex: 0
      }),
    /*
    DARK: () => new MapboxVector({
      styleUrl: 'mapbox://styles/monitorfish/cklv7vc0f1ej817o5ivmkjmrs',
      accessToken: process.env.REACT_APP_MAPBOX_KEY,
      className: Layers.BASE_LAYER.code,
      zIndex: 0
    }),
    */
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
    function addLayerToMap() {
      if (map) {
        if (!selectedBaseLayer) {
          // TODO Does this work? This looks like a really bad pattern. Use a ref?
          selectedBaseLayer = BaseLayer.OSM.code
        }
        if (baseLayersObjects[selectedBaseLayer]) {
          map.getLayers().push(baseLayersObjects[selectedBaseLayer]())
        }
      }
    }

    addLayerToMap()
  }, [map])

  useEffect(() => {
    function showAnotherBaseLayer() {
      if (map && selectedBaseLayer && baseLayersObjects[selectedBaseLayer]) {
        const olLayers = map.getLayers()
        // TODO Is the dangling `_` in `layer.className_` a mistake?
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
    }

    showAnotherBaseLayer()
  }, [baseLayersObjects, map, selectedBaseLayer])

  return <></>
}

export const BaseLayer = React.memo(UnmemoizedBaseLayer)

BaseLayer.displayName = 'BaseLayer'
