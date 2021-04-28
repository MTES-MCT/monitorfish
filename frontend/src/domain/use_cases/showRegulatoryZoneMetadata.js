import { getRegulatoryZoneMetadataFromAPI } from '../../api/fetch'
import {
  closeRegulatoryZoneMetadataPanel,
  resetLoadingRegulatoryZoneMetadata,
  setLoadingRegulatoryZoneMetadata,
  setRegulatoryZoneMetadata
} from '../reducers/Regulatory'
import { mapToRegulatoryZone } from '../entities/regulatory'
import { setError } from '../reducers/Global'

const showRegulatoryZoneMetadata = regulatoryZone => dispatch => {
  if (regulatoryZone) {
    dispatch(setLoadingRegulatoryZoneMetadata())
    getRegulatoryZoneMetadataFromAPI(regulatoryZone).then(regulatoryZoneProperties => {
      const regulatoryZone = mapToRegulatoryZone(regulatoryZoneProperties)
      dispatch(setRegulatoryZoneMetadata(regulatoryZone))
    }).catch(error => {
      console.error(error)
      dispatch(closeRegulatoryZoneMetadataPanel())
      dispatch(setError(error))
      dispatch(resetLoadingRegulatoryZoneMetadata())
    })
  }
}

export default showRegulatoryZoneMetadata
