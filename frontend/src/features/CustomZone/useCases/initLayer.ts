import { THEME } from '@mtes-mct/monitor-ui'
import { Feature } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import { Geometry } from 'ol/geom'
import VectorImageLayer from 'ol/layer/VectorImage'
import VectorSource from 'ol/source/Vector'
import { Circle, Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'

import { LayerProperties } from '../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../domain/entities/layers/types'
import { OpenLayersGeometryType } from '../../../domain/entities/map/constants'
import { VectorLayerWithName } from '../../../domain/types/layer'
import { getColorWithAlpha, getHashDigitsFromString } from '../../map/layers/styles/utils'
import { monitorfishMap } from '../../map/monitorfishMap'
import { DIGIT_TO_LAYER_COLOR_MAP } from '../constants'
import { CustomZone } from '../types'

import type { MainAppThunk } from '../../../store'

/**
 * initialise Custom Zone layer
 */
export const initLayer = (): MainAppThunk => (_, getState) => {
  const { zones } = getState().customZone
  const showedZones = Object.values(zones).filter(zone => zone.isShown)

  const showedFeatures = getFeaturesFromGeoJson(showedZones)

  const customZoneLayer = new VectorImageLayer({
    className: MonitorFishLayer.CUSTOM,
    source: new VectorSource(),
    style: feature => getLayerStyle(feature as Feature<Geometry>),
    zIndex: LayerProperties.CUSTOM.zIndex
  }) as VectorLayerWithName
  customZoneLayer.name = MonitorFishLayer.CUSTOM

  monitorfishMap.getLayers().push(customZoneLayer)

  customZoneLayer.getSource()?.addFeatures(showedFeatures)
  customZoneLayer.changed()
}

function getFeaturesFromGeoJson(customZones: CustomZone[]) {
  if (!customZones.length) {
    return []
  }

  return customZones
    .map(zone => {
      const features = new GeoJSON().readFeatures(zone.feature)

      features
        .filter(feature => feature.getGeometry()?.getType() === OpenLayersGeometryType.POLYGON)
        .forEach(feature => feature.set('name', zone.name))

      return features
    })
    .flat()
}

function getLayerStyle(feature: Feature) {
  const isPoint = feature.getGeometry()?.getType() === OpenLayersGeometryType.POINT
  const uuid: string = feature.get('uuid')
  const name = feature.get('name')

  const defaultStyle = getCustomZoneStyle(getColorWithAlpha(THEME.color.earthYellow, 0.75), name, isPoint)

  const randomDigits = getHashDigitsFromString(uuid)
  if (!randomDigits) {
    return [defaultStyle]
  }

  const color = DIGIT_TO_LAYER_COLOR_MAP.get(randomDigits)
  if (!color) {
    return [defaultStyle]
  }

  return [getCustomZoneStyle(getColorWithAlpha(color, 0.75), name, isPoint)]
}

function getCustomZoneStyle(color: string | undefined, name: string | undefined, isPoint: boolean) {
  const fill = new Fill({
    color
  })

  const stroke = new Stroke({
    color: THEME.color.darkGoldenrod,
    width: 1
  })

  return new Style({
    fill,
    image: isPoint
      ? new Circle({
          fill,
          radius: 5,
          stroke
        })
      : undefined,
    stroke,
    text: new Text({
      fill: new Fill({ color: THEME.color.darkGoldenrod }),
      font: '12px Marianne',
      stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
      text: name
    })
  })
}
