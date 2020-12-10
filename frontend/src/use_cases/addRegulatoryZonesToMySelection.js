import {addRegulatoryZonesToSelection} from "../reducers/Layer";

const addRegulatoryZonesToMySelection = regulatoryZones => (dispatch, getState) => {
    let regulatoryZonesToAdd = {...getState().layer.selectedRegulatoryZones}
    Object.keys(regulatoryZones).forEach(regulatoryZoneName => {
        if(!regulatoryZonesToAdd[regulatoryZoneName] || !regulatoryZonesToAdd[regulatoryZoneName].length) {
            regulatoryZonesToAdd[regulatoryZoneName] = regulatoryZones[regulatoryZoneName]
        } else {
            regulatoryZones[regulatoryZoneName].forEach(regulatorySubZone => {
                if(!regulatoryZonesToAdd[regulatoryZoneName].some(item =>
                    item.layerName === regulatorySubZone.layerName &&
                    item.gears === regulatorySubZone.gears &&
                    item.zone === regulatorySubZone.zone &&
                    item.species === regulatorySubZone.species &&
                    item.regulatoryReference === regulatorySubZone.regulatoryReference)) {
                    regulatoryZonesToAdd[regulatoryZoneName].concat(regulatorySubZone)
                }
            })
        }
    })

    dispatch(addRegulatoryZonesToSelection(regulatoryZonesToAdd))
}

export default addRegulatoryZonesToMySelection