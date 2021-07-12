import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './map'
import Feature from 'ol/Feature'
import Layers from './layers'
import LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import { Vessel } from './vessel'

class EstimatedPosition {
  /**
   * EstimatedPosition object for building OpenLayers estimated position feature
   * @param {string[]} currentPosition - The [longitude, latitude] of the current position
   * @param {string[]} estimatedPosition - The [longitude, latitude] of the estimated position
   * @param {{
      id: string,
      isLight: boolean,
      vesselsLastPositionVisibility: Object,
      dateTime: Date
   * }} options
   */
  constructor (currentPosition, estimatedPosition, options) {
    this.currentCoordinates = transform([currentPosition[0], currentPosition[1]], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    this.estimatedCoordinates = transform([estimatedPosition[0], estimatedPosition[1]], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    this.features = []
    let lineColor = 'rgb(5, 5, 94, 0.2)'
    if (options.isLight) {
      lineColor = 'rgb(202, 204, 224, 0.2)'
    }

    let vesselColor = 'rgb(5, 5, 94)'
    if (options.isLight) {
      vesselColor = 'rgb(202, 204, 224)'
    }

    const isShowed = options.vesselsLastPositionVisibility
      ? !!Vessel.getVesselOpacity(options.vesselsLastPositionVisibility, options.dateTime)
      : true

    const lineFeature = new Feature({
      geometry: new LineString([this.currentCoordinates, this.estimatedCoordinates]),
      latitude: estimatedPosition[1],
      longitude: estimatedPosition[0],
      color: lineColor,
      isShowed,
      dateTime: options.dateTime
    })
    lineFeature.setId(`${Layers.VESSEL_ESTIMATED_POSITION.code}:${options.id}`)

    const circleFeature = new Feature({
      geometry: new Point(this.estimatedCoordinates),
      isCircle: true,
      latitude: estimatedPosition[1],
      longitude: estimatedPosition[0],
      color: vesselColor,
      isShowed,
      dateTime: options.dateTime
    })
    circleFeature.setId(`${Layers.VESSEL_ESTIMATED_POSITION.code}:circle:${options.id}`)

    this.features.push(lineFeature, circleFeature)
  }
}

export {
  EstimatedPosition
}
