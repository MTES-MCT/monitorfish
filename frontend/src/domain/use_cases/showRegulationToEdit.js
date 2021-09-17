import { setRegulatoryZoneMetadata } from '../shared_slices/Regulatory'
import { getRegulatoryZoneFromAPI } from '../../api/fetch'
import { mapToRegulatoryZone } from '../entities/regulatory'
import { setError } from '../shared_slices/Global'
import Layers from '../entities/layers'

const showRegulationToEdit = regulatoryZone => async (dispatch) => {
  return getRegulatoryZoneFromAPI(Layers.REGULATORY.code, regulatoryZone)
    .then(response => {
      const feature = response.features[0]
      console.log('showRegulationToEdit')
      console.log(feature)
      const regulatoryZoneMetadata = mapToRegulatoryZone(feature.properties)
      regulatoryZoneMetadata.geometry = feature.geometry
      regulatoryZoneMetadata.id = feature.id.split('.')[1]
      dispatch(setRegulatoryZoneMetadata(regulatoryZoneMetadata))
    }).catch(error => {
      dispatch(setError(error))
    })
}

export default showRegulationToEdit
