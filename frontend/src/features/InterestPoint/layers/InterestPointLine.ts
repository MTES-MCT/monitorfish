import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'

export class InterestPointLine {
  static typeProperty = 'type'
  static isHiddenByZoomProperty = 'isHiddenByZoom'

  /**
   * InterestPointLine object for building OpenLayers interest point line to draggable overlay
   *
   * @param fromCoordinates - The [longitude, latitude] of the start of the line (the interest point position)
   * @param toCoordinates - The [longitude, latitude] of the overlay position
   * @param featureId - The feature identifier
   */
  static getFeature(fromCoordinates: string[], toCoordinates: string[], featureId: string) {
    const interestPointLineFeature = new Feature({
      // TODO Fix that: `ype 'string[]' is not assignable to type 'number | Coordinate'.`. Legacy code.
      // @ts-ignore
      geometry: new LineString([fromCoordinates, toCoordinates])
    })

    interestPointLineFeature.setId(featureId)

    return interestPointLineFeature
  }

  static getFeatureId(uuid) {
    return `${uuid}:line`
  }
}
