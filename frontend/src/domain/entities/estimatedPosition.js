import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './map'
import Feature from 'ol/Feature'
import Layers from './layers'
import Fill from 'ol/style/Fill'
import Style from 'ol/style/Style'
import LineString from 'ol/geom/LineString'
import Stroke from 'ol/style/Stroke'

export class EstimatedPosition {
  /**
   * EstimatedPosition object for building OpenLayers estimated position feature
   * @param {string[]} currentPosition - The [longitude, latitude] of the current position
   * @param {string[]} estimatedPosition - The [longitude, latitude] of the estimated position
   * @param {{
      id: string,
      isLight: boolean,
   * }} options
   */
  constructor (currentPosition, estimatedPosition, options) {
    this.currentCoordinates = transform([currentPosition[0], currentPosition[1]], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    this.estimatedCoordinates = transform([estimatedPosition[0], estimatedPosition[1]], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    this.feature = new Feature({
      geometry: new LineString([this.currentCoordinates, this.estimatedCoordinates]),
      latitude: estimatedPosition[1],
      longitude: estimatedPosition[0]
    })

    let vesselColor = 'rgb(5, 5, 94, 0.2)'
    if (options.isLight) {
      vesselColor = 'rgb(202, 204, 224, 0.2)'
    }

    this.feature.setId(`${Layers.VESSEL_ESTIMATED_POSITION.code}:${options.id}`)
    this.feature.setStyle(new Style({
      fill: new Fill({ color: vesselColor, weight: 4 }),
      stroke: new Stroke({ color: vesselColor, width: 3 })
    }))
  }
}
