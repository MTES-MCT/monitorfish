import { removeRegulatoryZonesFromMyLayers } from '../../../shared_slices/Regulatory'

const removeRegulatoryZoneFromMySelection = regulatoryZone => dispatch => {
  dispatch(removeRegulatoryZonesFromMyLayers(regulatoryZone))
}

export default removeRegulatoryZoneFromMySelection
