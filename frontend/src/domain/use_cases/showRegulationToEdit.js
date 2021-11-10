import { setRegulatoryZoneMetadata } from '../shared_slices/Regulatory'
import { getRegulatoryZoneFromAPI, REGULATORY_ZONE_METADATA_ERROR_MESSAGE } from '../../api/fetch'
import { mapToRegulatoryZone } from '../entities/regulatory'
import { setError } from '../shared_slices/Global'
import Layers from '../entities/layers'

const showRegulationToEdit = regulatoryZone => async (dispatch) => {
  return getRegulatoryZoneFromAPI(Layers.REGULATORY.code, regulatoryZone)
    .then(response => {
      const feature = response.features[0]
      const regulatoryZoneMetadata = mapToRegulatoryZone(feature.properties)
      const {
        regulatoryReferences,
        upcomingRegulatoryReferences
      } = regulatoryZoneMetadata
      regulatoryZoneMetadata.regulatoryReferences = JSON.parse(regulatoryReferences)
      regulatoryZoneMetadata.upcomingRegulatoryReferences =
        upcomingRegulatoryReferences && upcomingRegulatoryReferences !== {}
          ? JSON.parse(upcomingRegulatoryReferences)
          : undefined
      regulatoryZoneMetadata.geometry = feature.geometry
      if (!regulatoryZoneMetadata.id) {
        regulatoryZoneMetadata.id = feature.id.split('.')[1]
      }
      dispatch(setRegulatoryZoneMetadata(regulatoryZoneMetadata))
    }).catch(error => {
      console.error(error)
      dispatch(setError(new Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)))
    })
}

export default showRegulationToEdit
