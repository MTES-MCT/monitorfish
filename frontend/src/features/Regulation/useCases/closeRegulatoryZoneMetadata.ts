import { regulationActions } from '../slice'

export const closeRegulatoryZoneMetadata = () => dispatch => {
  dispatch(regulationActions.closeRegulatoryZoneMetadataPanel())
  dispatch(regulationActions.resetRegulatoryGeometriesToPreview())
}
