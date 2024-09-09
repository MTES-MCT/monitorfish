import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import { transform } from 'ol/proj'

import { LayerProperties } from './layers/constants'
import { MonitorFishLayer } from './layers/types'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './map/constants'
import { Vessel } from './vessel/vessel'
import { COLORS } from '../../constants/constants'
import { theme } from '../../ui/theme'

class EstimatedPosition {
  static colorProperty = 'color'
  static opacityProperty = 'opacity'
  static isCircleProperty = 'isCircle'
  static isHiddenProperty = 'isHidden'

  /**
   * For building OpenLayers estimated position feature
   * @param {import('./vessel/types').VesselEnhancedLastPositionWebGLObject} vessel - The vessel
   * @param {{
      isLight: boolean,
      vesselIsHidden: Date
      vesselIsOpacityReduced: Date
      hideNonSelectedVessels: boolean
   * }} options
   * @returns [lineFeature, circleFeature] - array containing 2 features: one for the line, one for the point symbolising the last position
   */
  static getFeatures(vessel, options) {
    const { dateTime, estimatedCurrentLatitude, estimatedCurrentLongitude, latitude, longitude } =
      vessel.vesselProperties

    if (!longitude || !latitude || !estimatedCurrentLongitude || !estimatedCurrentLatitude) {
      return null
    }

    const currentCoordinates = transform([longitude, latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    const estimatedCoordinates = transform(
      [estimatedCurrentLongitude, estimatedCurrentLatitude],
      WSG84_PROJECTION,
      OPENLAYERS_PROJECTION
    )
    const vesselCompositeIdentifier = vessel.vesselFeatureId.replace(`${MonitorFishLayer.VESSELS}:`, '')

    const estimatedPositionObject = {
      dateTime,
      latitude: estimatedCurrentLatitude,
      longitude: estimatedCurrentLongitude
    }

    const features = []
    let lineColor = theme.color.charcoalShadow
    if (options.isLight) {
      lineColor = 'rgb(202, 204, 224, 0.2)'
    }

    let vesselColor = COLORS.charcoal
    if (options.isLight) {
      vesselColor = 'rgb(202, 204, 224)'
    }

    const opacity = Vessel.getVesselOpacity(dateTime, options.vesselIsHidden, options.vesselIsOpacityReduced)

    const lineFeature = new Feature({
      color: lineColor,
      geometry: new LineString([currentCoordinates, estimatedCoordinates]),
      isHidden: options.hideNonSelectedVessels,
      opacity
    })
    lineFeature.estimatedPosition = estimatedPositionObject
    lineFeature.setId(`${LayerProperties.VESSEL_ESTIMATED_POSITION.code}:${vesselCompositeIdentifier}`)

    const circleFeature = new Feature({
      color: vesselColor,
      geometry: new Point(estimatedCoordinates),
      isCircle: true,
      isHidden: options.hideNonSelectedVessels,
      opacity
    })
    circleFeature.estimatedPosition = estimatedPositionObject
    circleFeature.setId(`${LayerProperties.VESSEL_ESTIMATED_POSITION.code}:circle:${vesselCompositeIdentifier}`)

    features.push(lineFeature, circleFeature)

    return features
  }
}

export { EstimatedPosition }
