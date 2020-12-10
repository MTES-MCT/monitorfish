import {removeRegulatoryZonesFromSelection} from "../reducers/Layer";

const removeRegulatoryZoneFromMySelection = regulatoryZone => (dispatch) => {
    dispatch(removeRegulatoryZonesFromSelection(regulatoryZone))
}

export default removeRegulatoryZoneFromMySelection