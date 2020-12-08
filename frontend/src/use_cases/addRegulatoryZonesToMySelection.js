import {addRegulatoryZonesToSelection} from "../reducers/Layer";

const addRegulatoryZonesToMySelection = regulatoryZones => (dispatch, getState) => {
    let regulatoryZonesToAdd = regulatoryZones.filter(regulatoryZone =>
        !getState().layer.selectedRegulatoryZones.some(alreadySelectedZone =>
            regulatoryZone.type === alreadySelectedZone.type && regulatoryZone.filter === alreadySelectedZone.filter))

    dispatch(addRegulatoryZonesToSelection(regulatoryZonesToAdd))
}

export default addRegulatoryZonesToMySelection