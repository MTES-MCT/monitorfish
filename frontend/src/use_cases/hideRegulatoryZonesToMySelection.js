import {removeRegulatoryZonesToSelection} from "../reducers/Layer";

const hideRegulatoryZonesToMySelection = regulatoryZones => (dispatch, getState) => {
    dispatch(removeRegulatoryZonesToSelection(regulatoryZones))
}

export default hideRegulatoryZonesToMySelection