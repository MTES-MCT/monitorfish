import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './map'
import Feature from 'ol/Feature'
import Layers from './layers'
import LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import { Vessel } from './vessel'
import { COLORS } from '../../constants/constants'

class EstimatedPosition {
  static colorProperty = 'color'
  static opacityProperty = 'opacity'
  static isCircleProperty = 'isCircle'

  /**
   * For building OpenLayers estimated position feature
   * @param {string[]} currentPosition - The [longitude, latitude] of the current position
   * @param {string[]} estimatedPosition - The [longitude, latitude] of the estimated position
   * @param {{
      id: string,
      isLight: boolean,
      dateTime: Date
      vesselIsHidden: Date
      vesselIsOpacityReduced: Date
   * }} options
   */
  static getFeatures (currentPosition, estimatedPosition, options) {
    const currentCoordinates = transform([currentPosition[0], currentPosition[1]], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    const estimatedCoordinates = transform([estimatedPosition[0], estimatedPosition[1]], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    const estimatedPositionObject = {
      latitude: estimatedPosition[1],
      longitude: estimatedPosition[0],
      dateTime: options.dateTime
    }

    const features = []
    let lineColor = COLORS.slateGrayLittleOpacity
    if (options.isLight) {
      lineColor = 'rgb(202, 204, 224, 0.2)'
    }

    let vesselColor = COLORS.vesselColor
    if (options.isLight) {
      vesselColor = 'rgb(202, 204, 224)'
    }

    const opacity = Vessel.getVesselOpacity(options.dateTime, options.vesselIsHidden, options.vesselIsOpacityReduced)

    const lineFeature = new Feature({
      geometry: new LineString([currentCoordinates, estimatedCoordinates]),
      color: lineColor,
      opacity
    })
    lineFeature.estimatedPosition = estimatedPositionObject
    lineFeature.setId(`${Layers.VESSEL_ESTIMATED_POSITION.code}:${options.id}`)

    const circleFeature = new Feature({
      geometry: new Point(estimatedCoordinates),
      isCircle: true,
      color: vesselColor,
      opacity
    })
    circleFeature.estimatedPosition = estimatedPositionObject
    circleFeature.setId(`${Layers.VESSEL_ESTIMATED_POSITION.code}:circle:${options.id}`)

    features.push(lineFeature, circleFeature)

    return features
  }
}

export {
  EstimatedPosition
}
