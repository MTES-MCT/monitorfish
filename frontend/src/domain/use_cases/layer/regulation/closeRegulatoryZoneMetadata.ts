import { closeRegulatoryZoneMetadataPanel, resetRegulatoryGeometriesToPreview } from '../../../shared_slices/Regulatory'

export const closeRegulatoryZoneMetadata = () => dispatch => {
  dispatch(closeRegulatoryZoneMetadataPanel())
  dispatch(resetRegulatoryGeometriesToPreview())
}
