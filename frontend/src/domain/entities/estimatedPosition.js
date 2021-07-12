import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './map'
import Feature from 'ol/Feature'
import Layers from './layers'
import LineString from 'ol/geom/LineString'
import { Vessel } from './vessel'

class EstimatedPosition {
  /**
   * EstimatedPosition object for building OpenLayers estimated position feature
   * @param {string[]} currentPosition - The [longitude, latitude] of the current position
   * @param {string[]} estimatedPosition - The [longitude, latitude] of the estimated position
   * @param {{
      id: string,
      isLight: boolean
   * }} options
   */
  constructor (currentPosition, estimatedPosition, options) {
    this.currentCoordinates = transform([currentPosition[0], currentPosition[1]], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    this.estimatedCoordinates = transform([estimatedPosition[0], estimatedPosition[1]], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    let vesselColor = 'rgb(5, 5, 94, 0.2)'
    if (options.isLight) {
      vesselColor = 'rgb(202, 204, 224, 0.2)'
    }

    this.feature = new Feature({
      geometry: new LineString([this.currentCoordinates, this.estimatedCoordinates]),
      latitude: estimatedPosition[1],
      longitude: estimatedPosition[0],
      color: vesselColor,
      isShowed: options.vesselsLastPositionVisibility ? !!Vessel.getVesselOpacity(options.vesselsLastPositionVisibility, options.dateTime) : true,
      dateTime: options.dateTime
    })

    this.feature.setId(`${Layers.VESSEL_ESTIMATED_POSITION.code}:${options.id}`)
  }
}

export {
  EstimatedPosition
}