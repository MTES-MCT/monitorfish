import { batch } from 'react-redux'
import { setRegulatoryZoneMetadata } from '../shared_slices/Regulatory'
import { getRegulatoryZoneFromAPI, REGULATORY_ZONE_METADATA_ERROR_MESSAGE } from '../../api/fetch'
import { mapToRegulatoryZone } from '../entities/regulatory'
import { setError, setIsEditPageOpen } from '../shared_slices/Global'
import Layers from '../entities/layers'
// si ne fonctionne pas alors on passe par le state

const showRegulationToEdit = regulatoryZone => async (dispatch) => {
  return getRegulatoryZoneFromAPI(Layers.REGULATORY.code, regulatoryZone)
    .then(response => {
      const feature = response.features[0]
      const regulatoryZoneMetadata = mapToRegulatoryZone(feature.properties)
      regulatoryZoneMetadata.geometry = feature.geometry
      regulatoryZoneMetadata.id = feature.id.split('.')[1]
      batch(() => {
        dispatch(setRegulatoryZoneMetadata(regulatoryZoneMetadata))
        dispatch(setIsEditPageOpen(true))
      })
    }).catch(error => {
      console.log(error)
      dispatch(setError(new Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)))
    })
}

export default showRegulationToEdit
