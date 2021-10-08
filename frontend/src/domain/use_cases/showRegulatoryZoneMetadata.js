import { getRegulatoryZoneMetadataFromAPI } from '../../api/fetch'
import {
  closeRegulatoryZoneMetadataPanel,
  resetLoadingRegulatoryZoneMetadata,
  setLoadingRegulatoryZoneMetadata,
  setRegulatoryZoneMetadata
} from '../shared_slices/Regulatory'
import { mapToRegulatoryZone } from '../entities/regulatory'
import { setError } from '../shared_slices/Global'
import { batch } from 'react-redux'

const showRegulatoryZoneMetadata = regulatoryZone => dispatch => {
  if (regulatoryZone) {
    dispatch(setLoadingRegulatoryZoneMetadata())
    getRegulatoryZoneMetadataFromAPI(regulatoryZone).then(regulatoryZoneProperties => {
      const regulatoryZone = mapToRegulatoryZone(regulatoryZoneProperties)
      regulatoryZone.regulatoryReferences = JSON.parse(regulatoryZone.regulatoryReferences)
      dispatch(setRegulatoryZoneMetadata(regulatoryZone))
    }).catch(error => {
      console.error(error)
      batch(() => {
        dispatch(closeRegulatoryZoneMetadataPanel())
        dispatch(setError(error))
        dispatch(resetLoadingRegulatoryZoneMetadata())
      })
    })
  }
}

export default showRegulatoryZoneMetadata
