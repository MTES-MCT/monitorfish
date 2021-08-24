import { closeRegulatoryZoneMetadataPanel } from '../shared_slices/Regulatory'

const closeRegulatoryZoneMetadata = () => dispatch => {
  dispatch(closeRegulatoryZoneMetadataPanel())
}

export default closeRegulatoryZoneMetadata
