import { addRegulatoryLayersToSelection } from '../reducers/Regulatory'

const addRegulatoryLayersToMySelection = regulatoryZones => (dispatch, getState) => {
  const regulatoryZonesToAdd = { ...getState().regulatory.selectedRegulatoryLayers }

  Object.keys(regulatoryZones).forEach(regulatoryZoneName => {
    if (!regulatoryZonesToAdd[regulatoryZoneName] || !regulatoryZonesToAdd[regulatoryZoneName].length) {
      regulatoryZonesToAdd[regulatoryZoneName] = regulatoryZones[regulatoryZoneName]
    } else {
      regulatoryZones[regulatoryZoneName].forEach(regulatorySubZone => {
        if (!regulatoryZonesToAdd[regulatoryZoneName].some(item =>
          item.layerName === regulatorySubZone.layerName &&
          item.zone === regulatorySubZone.zone)) {
          regulatoryZonesToAdd[regulatoryZoneName] = regulatoryZonesToAdd[regulatoryZoneName].concat(regulatorySubZone)
        }
      })
    }
  })

  dispatch(addRegulatoryLayersToSelection(regulatoryZonesToAdd))
}

export default addRegulatoryLayersToMySelection
