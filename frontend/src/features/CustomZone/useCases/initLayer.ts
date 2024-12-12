import { LayerProperties, OpenLayersGeometryType } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { Feature } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import { Geometry } from 'ol/geom'
import VectorImageLayer from 'ol/layer/VectorImage'
import VectorSource from 'ol/source/Vector'

import { computeCustomZoneStyle } from '../utils/computeCustomZoneStyle'

import type { CustomZone } from '../types'
import type { MainAppThunk } from '@store'

/**
 * initialise Custom Zone layer
 */
export const initLayer = (): MainAppThunk => (_, getState) => {
  const { zones } = getState().customZone
  const showedZones = Object.values(zones).filter(zone => zone.isShown)

  const showedFeatures = getFeaturesFromGeoJson(showedZones)

  const customZoneLayer = new VectorImageLayer({
    className: MonitorFishMap.MonitorFishLayer.CUSTOM,
    source: new VectorSource({
      features: showedFeatures
    }),
    style: feature => getLayerStyle(feature as Feature<Geometry>),
    zIndex: LayerProperties.CUSTOM.zIndex
  }) as MonitorFishMap.VectorImageLayerWithName
  customZoneLayer.name = MonitorFishMap.MonitorFishLayer.CUSTOM

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
