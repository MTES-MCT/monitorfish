import {removeRegulatoryZonesToSelection} from "../reducers/Layer";

const removeRegulatoryZoneFromMySelection = regulatoryZone => (dispatch) => {
    dispatch(removeRegulatoryZonesToSelection(regulatoryZone))
}

export default removeRegulatoryZoneFromMySelection