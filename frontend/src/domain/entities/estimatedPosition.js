import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './map/constants'
import Feature from 'ol/Feature'
import { Layer } from './layers/constants'
import LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import { COLORS } from '../../constants/constants'
import { theme } from '../../ui/theme'
import { Vessel } from './vessel/vessel'

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
  static getFeatures (vessel, options) {
    const {
      longitude,
      latitude,
      estimatedCurrentLongitude,
      estimatedCurrentLatitude,
      dateTime
    } = vessel.vesselProperties

    if (!longitude || !latitude || !estimatedCurrentLongitude || !estimatedCurrentLatitude) return null

    const currentCoordinates = transform([longitude, latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    const estimatedCoordinates = transform([estimatedCurrentLongitude, estimatedCurrentLatitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    const vesselCompositeIdentifier = vessel.vesselFeatureId.replace(`${Layer.VESSELS.code}:`, '')

    const estimatedPositionObject = {
      latitude: estimatedCurrentLatitude,
      longitude: estimatedCurrentLongitude,
      dateTime: dateTime
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
      geometry: new LineString([currentCoordinates, estimatedCoordinates]),
      color: lineColor,
      opacity,
      isHidden: options.hideNonSelectedVessels
    })
    lineFeature.estimatedPosition = estimatedPositionObject
    lineFeature.setId(`${Layer.VESSEL_ESTIMATED_POSITION.code}:${vesselCompositeIdentifier}`)

    const circleFeature = new Feature({
      geometry: new Point(estimatedCoordinates),
      isCircle: true,
      color: vesselColor,
      opacity,
      isHidden: options.hideNonSelectedVessels
    })
    circleFeature.estimatedPosition = estimatedPositionObject
    circleFeature.setId(`${Layer.VESSEL_ESTIMATED_POSITION.code}:circle:${vesselCompositeIdentifier}`)

    features.push(lineFeature, circleFeature)

    return features
  }
}

export {
  EstimatedPosition
}
