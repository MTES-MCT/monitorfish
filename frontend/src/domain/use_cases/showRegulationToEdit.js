import { setRegulatoryZoneMetadata } from '../shared_slices/Regulatory'
import { getRegulatoryZoneFromAPI, REGULATORY_ZONE_METADATA_ERROR_MESSAGE } from '../../api/fetch'
import { mapToRegulatoryZone } from '../entities/regulatory'
import { setError } from '../shared_slices/Global'
import Layers from '../entities/layers'

const showRegulationToEdit = regulatoryZone => async (dispatch, getState) => {
  return getRegulatoryZoneFromAPI(Layers.REGULATORY.code, regulatoryZone, getState().global.inBackofficeMode)
    .then(feature => {
      const regulatoryZoneMetadata = mapToRegulatoryZone(feature)

      dispatch(setRegulatoryZoneMetadata(regulatoryZoneMetadata))
    }).catch(error => {
      console.error(error)
      dispatch(setError(new Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)))
    })
}

export default showRegulationToEdit
