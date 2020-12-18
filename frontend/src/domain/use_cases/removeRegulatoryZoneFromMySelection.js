import {removeRegulatoryZonesFromSelection} from "../reducers/Regulatory";

const removeRegulatoryZoneFromMySelection = regulatoryZone => (dispatch) => {
    dispatch(removeRegulatoryZonesFromSelection(regulatoryZone))
}

export default removeRegulatoryZoneFromMySelection