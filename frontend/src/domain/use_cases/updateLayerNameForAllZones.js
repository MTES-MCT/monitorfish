import { sendRegulationTransaction } from '../../api/fetch'
import { setLayerNameUpdated } from '../../features/backoffice/Regulation.slice'
import { setError } from '../shared_slices/Global'
import {
  REGULATION_ACTION_TYPE,
  getRegulatoryFeatureId,
  mapToRegulatoryFeatureObject
} from '../entities/regulatory'
import { Feature } from 'ol'

import {
  setLayersTopicsByRegTerritory
} from '../shared_slices/Regulatory'

const UPDATE_LAYER_NAME_ERROR = 'Une erreur est survenue lors la mise à jour de la thématique'

const updateLayerNameForAllZones = (territory, lawType, oldLayerName, newLayerName) => (dispatch, getState) => {
  const { layersTopicsByRegTerritory } = getState().regulatory
  if (!layersTopicsByRegTerritory || !layersTopicsByRegTerritory[territory] ||
      !layersTopicsByRegTerritory[territory][lawType]) {
    console.error(`${UPDATE_LAYER_NAME_ERROR}
      One value is undefined: 
      layersTopicsByRegTerritory is ${layersTopicsByRegTerritory}
      territory is ${territory}
      lawType is ${lawType}`)
    dispatch(setError(new Error(UPDATE_LAYER_NAME_ERROR)))
  }
  if (layersTopicsByRegTerritory[territory][lawType][oldLayerName]) {
    const zoneListToUpdate = layersTopicsByRegTerritory[territory][lawType][oldLayerName]
    const promisesList = zoneListToUpdate.map((zone) => {
      const featureObject = mapToRegulatoryFeatureObject({
        ...zone,
        layerName: newLayerName
      })
      const feature = new Feature(featureObject)
      feature.setId(getRegulatoryFeatureId(zone.id))
      return new Promise((resolve, reject) => {
        sendRegulationTransaction(feature, REGULATION_ACTION_TYPE.UPDATE)
          .then(_ => resolve(true))
          .catch(e => reject(e))
      })
    })
    return Promise.all(promisesList)
      .then(_ => {
        const newTerritoryObject = { ...layersTopicsByRegTerritory[territory] }
        const newLawTypeObject = { ...newTerritoryObject[lawType] }
        newLawTypeObject[newLayerName] = [...newLawTypeObject[oldLayerName]]
        delete newLawTypeObject[oldLayerName]
        newTerritoryObject[lawType] = newLawTypeObject
        const newLayersTopicsByRegTerritory = {
          ...layersTopicsByRegTerritory,
          [territory]: newTerritoryObject
        }
        dispatch(setLayersTopicsByRegTerritory(newLayersTopicsByRegTerritory))
        dispatch(setLayerNameUpdated(true))
      })
      .catch(e => {
        console.error(e)
        dispatch(setError(e))
      })
  } else {
    dispatch(setLayerNameUpdated(true))
  }
}

export default updateLayerNameForAllZones
