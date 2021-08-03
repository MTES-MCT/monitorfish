import { removeRegulatoryZonesFromMyLayers } from '../reducers/Regulatory'

const removeRegulatoryZoneFromMySelection = regulatoryZone => (dispatch) => {
  dispatch(removeRegulatoryZonesFromMyLayers(regulatoryZone))
}

export default removeRegulatoryZoneFromMySelection
