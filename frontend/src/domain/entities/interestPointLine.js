import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'

export class InterestPointLine {
  static typeProperty = 'type'
  static isHiddenByZoomProperty = 'isHiddenByZoom'
  /**
   * InterestPointLine object for building OpenLayers interest point line to draggable overlay
   * @param {string[]} fromCoordinates - The [longitude, latitude] of the start of the line (the interest point position)
   * @param {string[]} toCoordinates - The [longitude, latitude] of the overlay position
   * @param {string} featureId - The feature identifier
   */
  static getFeature (fromCoordinates, toCoordinates, featureId) {
    const interestPointLineFeature = new Feature({
      geometry: new LineString([fromCoordinates, toCoordinates])
    })

    interestPointLineFeature.setId(featureId)

    return interestPointLineFeature
  }

  static getFeatureId (uuid) {
    return `${uuid}:line`
  }
}
