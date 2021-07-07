import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import Layers from './layers'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'

export const vesselLabel = {
  VESSEL_NATIONALITY: 'VESSEL_NATIONALITY',
  VESSEL_NAME: 'VESSEL_NAME',
  VESSEL_INTERNAL_REFERENCE_NUMBER: 'VESSEL_INTERNAL_REFERENCE_NUMBER',
  VESSEL_FLEET_SEGMENT: 'VESSEL_FLEET_SEGMENT'
}

export class VesselLabelLine {
  /**
   * VesselLabelLine object for building OpenLayers vessel line to label feature
   * @param {string[]} fromCoordinates - The [longitude, latitude] of the start of the line (the vessel position)
   * @param {string[]} toCoordinates - The [longitude, latitude] of the label position
   * @param {string} featureId - The feature identifier
   */
  constructor (fromCoordinates, toCoordinates, featureId) {
    const labelLineFeature = new Feature({
      geometry: new LineString([fromCoordinates, toCoordinates])
    })
    labelLineFeature.setId(featureId)

    return labelLineFeature
  }

  static getFeatureId (identity) {
    return `${Layers.VESSELS_LABEL.code}:${identity.internalReferenceNumber}/${identity.ircs}/${identity.externalReferenceNumber}`
  }

  static labelLineStyle = new Style({
    stroke: new Stroke({
      color: 'rgb(5, 5, 94)',
      lineDash: [4, 4],
      width: 2
    })
  })
}
