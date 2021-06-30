import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './map'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Layers from './layers'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'

export const VESSEL_ICON_STYLE = 10
export const VESSEL_LABEL_STYLE = 100
export const VESSEL_SELECTOR_STYLE = 200

export class EstimatedPosition {
  /**
   * EstimatedPosition object for building OpenLayers vessel feature
   * @param {EstimatedPositionLastPosition} vessel
   * @param {{
      id: string,
      vesselsLastPositionVisibility: Object,
      isLight: boolean,
      temporaryEstimatedPositionsToHighLightOnMap: Object[]
   * }} options
   */
  constructor (latitude, longitude, id) {
    this.coordinates = transform([longitude, latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    this.feature = new Feature({
      geometry: new Point(this.coordinates),
      latitude: latitude,
      longitude: longitude,
    })

    this.feature.setId(`${Layers.VESSEL_ESTIMATION.code}:${id}`)

    this.feature.setStyle([new CircleStyle({
      radius: 4,
      fill: new Fill({
        color: 'rgb(5, 5, 94)'
      })
    })])
  }
}
