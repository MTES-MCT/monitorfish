import { Feature } from 'ol'

import { sendRegulationTransaction } from '../../../api/geoserver'
import { setError } from '../../MainWindow/slice'
import { setLayersTopicsByRegTerritory, setRegulatoryLayerLawTypes } from '../slice'
import { getRegulatoryFeatureId, mapToRegulatoryFeatureObject, REGULATION_ACTION_TYPE } from '../utils'

const UPDATE_TOPIC_NAME_ERROR = 'Une erreur est survenue lors la mise à jour de la thématique'

const updateTopicForAllZones = (territory, lawType, oldLayerName, newLayerName) => (dispatch, getState) => {
  const { layersTopicsByRegTerritory } = getState().regulatory
  if (
    !layersTopicsByRegTerritory ||
    !layersTopicsByRegTerritory[territory] ||
    !layersTopicsByRegTerritory[territory][lawType]
  ) {
    console.error(`${UPDATE_TOPIC_NAME_ERROR}
      One value is undefined:
      layersTopicsByRegTerritory is ${layersTopicsByRegTerritory}
      territory is ${territory}
      lawType is ${lawType}`)
    dispatch(setError(new Error(UPDATE_TOPIC_NAME_ERROR)))

    return
  }

  if (layersTopicsByRegTerritory[territory][lawType][oldLayerName]) {
    const zoneListToUpdate = layersTopicsByRegTerritory[territory][lawType][oldLayerName]
    const promiseList = zoneListToUpdate.map(zone => {
      const feature = buildZoneFeature(zone, newLayerName)

      return new Promise((resolve, reject) => {
        sendRegulationTransaction(feature, REGULATION_ACTION_TYPE.UPDATE)
          .then(_ => resolve(true))
          .catch(e => reject(e))
      })
    })

    return Promise.all(promiseList)
      .then(_ => {
        const newLayersTopicsByRegTerritory = mutateLayersTopicsWithNewTopic(
          layersTopicsByRegTerritory,
          territory,
          lawType,
          newLayerName,
          oldLayerName
        )
        dispatch(setLayersTopicsByRegTerritory(newLayersTopicsByRegTerritory))
        dispatch(setRegulatoryLayerLawTypes(newLayersTopicsByRegTerritory))
      })
      .catch(e => {
        console.error(e)
        dispatch(setError(e))
      })
  }
}

function buildZoneFeature(zone, newLayerName) {
  const featureObject = mapToRegulatoryFeatureObject({
    ...zone,
    topic: newLayerName
  })
  const feature = new Feature(featureObject)
  feature.setId(getRegulatoryFeatureId(zone.id))

  return feature
}

function mutateLayersTopicsWithNewTopic(layersTopicsByRegTerritory, territory, lawType, newTopic, oldTopic) {
  const newTerritoryObject = { ...layersTopicsByRegTerritory[territory] }
  const newLawTypeObject = { ...newTerritoryObject[lawType] }
  newLawTypeObject[newTopic] = [...newLawTypeObject[oldTopic]]
  delete newLawTypeObject[oldTopic]
  newTerritoryObject[lawType] = newLawTypeObject

  return {
    ...layersTopicsByRegTerritory,
    [territory]: newTerritoryObject
  }
}

export default updateTopicForAllZones
