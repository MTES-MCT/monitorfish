import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import Layers from './layers'

export const vesselLabel = {
  VESSEL_NATIONALITY: 'VESSEL_NATIONALITY',
  VESSEL_NAME: 'VESSEL_NAME',
  VESSEL_INTERNAL_REFERENCE_NUMBER: 'VESSEL_INTERNAL_REFERENCE_NUMBER',
  VESSEL_FLEET_SEGMENT: 'VESSEL_FLEET_SEGMENT'
}

export class VesselLabelLine {
  static opacityProperty = 'opacity'

  /**
   * VesselLabelLine object for building OpenLayers vessel line to label feature
   * @param {string[]} fromCoordinates - The [longitude, latitude] of the start of the line (the vessel position)
   * @param {string[]} toCoordinates - The [longitude, latitude] of the label position
   * @param {string} featureId - The feature identifier
   */
  static getFeature (fromCoordinates, toCoordinates, featureId) {
    const labelLineFeature = new Feature({
      geometry: new LineString([fromCoordinates, toCoordinates])
    })
    labelLineFeature.setId(featureId)

    return labelLineFeature
  }

  static getFeatureId (identity) {
    return `${Layers.VESSELS_LABEL.code}:${identity.internalReferenceNumber}/${identity.ircs}/${identity.externalReferenceNumber}`
  }
}
