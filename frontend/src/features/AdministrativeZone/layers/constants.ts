import TileLayer from 'ol/layer/Tile'
import { TileWMS } from 'ol/source'

export const FAO_LAYER = new TileLayer({
  source: new TileWMS({
    params: { FORMAT: 'image/png', LAYERS: 'monitorfish:fao_areas', STYLES: 'monitorfish:FAO style', TILED: true },
    serverType: 'geoserver',
    // Countries have transparency, so do not fade tiles:
    transition: 0,

    url: `${import.meta.env.FRONTEND_GEOSERVER_REMOTE_URL}/geoserver/monitorfish/wms`
  })
})
