import { closeRegulatoryZoneMetadataPanel, resetRegulatoryGeometriesToPreview } from '../../../shared_slices/Regulatory'

const closeRegulatoryZoneMetadata = () => dispatch => {
  dispatch(closeRegulatoryZoneMetadataPanel())
  dispatch(resetRegulatoryGeometriesToPreview())
}

export default closeRegulatoryZoneMetadata
