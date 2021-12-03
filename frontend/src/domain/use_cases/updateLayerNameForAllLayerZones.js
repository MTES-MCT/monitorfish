import { sendRegulationTransaction } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { getRegulatoryFeatureId, mapToRegulatoryFeatureObject, REGULATION_ACTION_TYPE } from '../entities/regulatory'
import { Feature } from 'ol'

import { setLayersTopicsByRegTerritory } from '../shared_slices/Regulatory'

const UPDATE_LAYER_NAME_ERROR = 'Une erreur est survenue lors la mise à jour de la thématique'

const updateLayerNameForAllLayerZones = (territory, lawType, oldLayerName, newLayerName) => (dispatch, getState) => {
  const { layersTopicsByRegTerritory } = getState().regulatory
  if (!layersTopicsByRegTerritory || !layersTopicsByRegTerritory[territory] ||
    !layersTopicsByRegTerritory[territory][lawType]) {
    console.error(`${UPDATE_LAYER_NAME_ERROR}
      One value is undefined: 
      layersTopicsByRegTerritory is ${layersTopicsByRegTerritory}
      territory is ${territory}
      lawType is ${lawType}`)
    dispatch(setError(new Error(UPDATE_LAYER_NAME_ERROR)))

    return
  }

  if (layersTopicsByRegTerritory[territory][lawType][oldLayerName]) {
    const zoneListToUpdate = layersTopicsByRegTerritory[territory][lawType][oldLayerName]
    const promiseList = zoneListToUpdate.map((zone) => {
      const feature = buildZoneFeature(zone, newLayerName)

      return new Promise((resolve, reject) => {
        sendRegulationTransaction(feature, REGULATION_ACTION_TYPE.UPDATE)
          .then(_ => resolve(true))
          .catch(e => reject(e))
      })
    })

    return Promise.all(promiseList)
      .then(_ => {
        const newLayersTopicsByRegTerritory = mutateLayersTopicsWithNewLayerName(layersTopicsByRegTerritory, territory, lawType, newLayerName, oldLayerName)
        dispatch(setLayersTopicsByRegTerritory(newLayersTopicsByRegTerritory))
      })
      .catch(e => {
        console.error(e)
        dispatch(setError(e))
      })
  }
}

function buildZoneFeature (zone, newLayerName) {
  const featureObject = mapToRegulatoryFeatureObject({
    ...zone,
    layerName: newLayerName
  })
  const feature = new Feature(featureObject)
  feature.setId(getRegulatoryFeatureId(zone.id))
  return feature
}

function mutateLayersTopicsWithNewLayerName (layersTopicsByRegTerritory, territory, lawType, newLayerName, oldLayerName) {
  const newTerritoryObject = { ...layersTopicsByRegTerritory[territory] }
  const newLawTypeObject = { ...newTerritoryObject[lawType] }
  newLawTypeObject[newLayerName] = [...newLawTypeObject[oldLayerName]]
  delete newLawTypeObject[oldLayerName]
  newTerritoryObject[lawType] = newLawTypeObject

  return {
    ...layersTopicsByRegTerritory,
    [territory]: newTerritoryObject
  }
}

export default updateLayerNameForAllLayerZones
