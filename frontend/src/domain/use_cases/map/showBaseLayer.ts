import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'
import TileWMS from 'ol/source/TileWMS'
import XYZ from 'ol/source/XYZ'

import { MonitorFishMap } from '../../../features/map/MonitorFishMap'
import { Layer } from '../../entities/layers/constants'
import { selectBaseLayer } from '../../shared_slices/Map'

import type { ImageTile } from 'ol'
import type Tile from 'ol/Tile'

export const showBaseLayer = (selectedBaseLayer: string) => dispatch => {
  if (!selectedBaseLayer || !baseLayersObjects[selectedBaseLayer]) {
    return
  }

  const olLayers = MonitorFishMap.getLayers()
  // @ts-ignore
  // eslint-disable-next-line no-underscore-dangle
  const layerToRemove = olLayers.getArray().find(layer => layer.className_ === Layer.BASE_LAYER.code)

  olLayers.insertAt(0, baseLayersObjects[selectedBaseLayer]())
  dispatch(selectBaseLayer(selectedBaseLayer))

  if (!layerToRemove) {
    return
  }

  setTimeout(() => {
    olLayers.remove(layerToRemove)
  }, 300)
}

const tileCacheMap = new Map<string, string>()
const loadTileFromCacheOrFetch = (imageTile: Tile, src: string) => {
  const imgElement = (imageTile as ImageTile).getImage()

  if (tileCacheMap.has(src)) {
    // @ts-ignore
    imgElement.src = tileCacheMap.get(src)

    return
  }

  fetch(src).then(response => {
    if (!response.ok) {
      return
    }

    response.blob().then(blob => {
      const objUrl = URL.createObjectURL(blob)
      tileCacheMap.set(src, objUrl)
      // @ts-ignore
      imgElement.src = objUrl
    })
  })
}

const baseLayersObjects = {
  DARK: () =>
    new TileLayer({
      className: Layer.BASE_LAYER.code,
      source: new XYZ({
        maxZoom: 19,
        tileLoadFunction: loadTileFromCacheOrFetch,
        urls: ['a', 'b', 'c', 'd'].map(
          subdomain => `https://${subdomain}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png`
        )
      }),
      zIndex: 0
    }),
  LIGHT: () =>
    new TileLayer({
      className: Layer.BASE_LAYER.code,
      source: new XYZ({
        maxZoom: 19,
        tileLoadFunction: loadTileFromCacheOrFetch,
        urls: ['a', 'b', 'c', 'd'].map(
          subdomain => `https://${subdomain}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`
        )
      }),
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
}
