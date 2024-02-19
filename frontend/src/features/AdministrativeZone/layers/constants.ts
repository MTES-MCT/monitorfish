import { getLayerNameFromTypeAndZone } from '@features/AdministrativeZone/useCases/utils'
import TileLayer from 'ol/layer/Tile'
import { TileWMS } from 'ol/source'
import { createXYZ } from 'ol/tilegrid'

import { LayerProperties } from '../../../domain/entities/layers/constants'

import type { TileLayerWithName } from '../../../domain/types/layer'

export const FAO_LAYER = new TileLayer({
  source: new TileWMS({
    params: { FORMAT: 'image/png', LAYERS: 'monitorfish:fao_areas', STYLES: 'monitorfish:FAO style', TILED: true },
    serverType: 'geoserver',
    tileGrid: createXYZ({ tileSize: 512 }),
    // Countries have transparency, so do not fade tiles:
    transition: 0,
    url: `${import.meta.env.FRONTEND_GEOSERVER_REMOTE_URL}/geoserver/monitorfish/wms`
  })
}) as TileLayerWithName

FAO_LAYER.name = getLayerNameFromTypeAndZone(LayerProperties.FAO.code, undefined)
