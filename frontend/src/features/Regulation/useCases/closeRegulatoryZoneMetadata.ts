import { closeRegulatoryZoneMetadataPanel, resetRegulatoryGeometriesToPreview } from '../slice'

export const closeRegulatoryZoneMetadata = () => dispatch => {
  dispatch(closeRegulatoryZoneMetadataPanel())
  dispatch(resetRegulatoryGeometriesToPreview())
}
