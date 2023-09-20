import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { Feature } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import { Geometry } from 'ol/geom'
import VectorImageLayer from 'ol/layer/VectorImage'
import VectorSource from 'ol/source/Vector'

import { LayerProperties } from '../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../domain/entities/layers/types'
import { OpenLayersGeometryType } from '../../../domain/entities/map/constants'
import { monitorfishMap } from '../../map/monitorfishMap'
import { computeCustomZoneStyle } from '../utils/computeCustomZoneStyle'

import type { VectorLayerWithName } from '../../../domain/types/layer'
import type { MainAppThunk } from '../../../store'
import type { CustomZone } from '../types'

/**
 * initialise Custom Zone layer
 */
export const initLayer = (): MainAppThunk => (_, getState) => {
  const { zones } = getState().customZone
  const showedZones = Object.values(zones).filter(zone => zone.isShown)

  const showedFeatures = getFeaturesFromGeoJson(showedZones)

  const customZoneLayer = new VectorImageLayer({
    className: MonitorFishLayer.CUSTOM,
    source: new VectorSource({
      features: showedFeatures
    }),
    style: feature => getLayerStyle(feature as Feature<Geometry>),
    zIndex: LayerProperties.CUSTOM.zIndex
  }) as VectorLayerWithName
  customZoneLayer.name = MonitorFishLayer.CUSTOM

  monitorfishMap.getLayers().push(customZoneLayer)
}

function getFeaturesFromGeoJson(customZones: CustomZone[]) {
  if (!customZones.length) {
    return []
  }

  return customZones
    .map(zone => {
      const features = new GeoJSON({
        dataProjection: WSG84_PROJECTION,
        featureProjection: OPENLAYERS_PROJECTION
      }).readFeatures(zone.feature)

      features
        .filter(feature => feature.getGeometry()?.getType() === OpenLayersGeometryType.POLYGON)
        .forEach(feature => feature.set('name', zone.name))

      return features
    })
    .flat()
}

function getLayerStyle(feature: Feature) {
  const uuid: string = feature.get('uuid')
  const name = feature.get('name')

  return computeCustomZoneStyle(uuid, name)
}
