import { sendRegulationTransaction } from '@api/geoserver'
import { getRegulatoryFeatureId, mapToRegulatoryFeatureObject, RegulationActionType } from '@features/Regulation/utils'
import { setError } from 'domain/shared_slices/Global'
import { Feature } from 'ol'

import { regulationActions } from '../../Regulation/slice'

import type { BackofficeAppThunk } from '@store'

const UPDATE_TOPIC_NAME_ERROR = 'Une erreur est survenue lors la mise à jour de la thématique'

export const updateTopicForAllZones =
  (territory: string, lawType: string, oldLayerName: string, newLayerName: string): BackofficeAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { layersTopicsByRegTerritory } = getState().regulation
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
          sendRegulationTransaction(feature, RegulationActionType.Update)
            .then(_ => resolve(true))
            .catch(e => reject(e))
        })
      })

      try {
        await Promise.all(promiseList)

        const newLayersTopicsByRegTerritory = mutateLayersTopicsWithNewTopic(
          layersTopicsByRegTerritory,
          territory,
          lawType,
          newLayerName,
          oldLayerName
        )
        dispatch(regulationActions.setLayersTopicsByRegTerritory(newLayersTopicsByRegTerritory))
        dispatch(regulationActions.setRegulatoryLayerLawTypes(newLayersTopicsByRegTerritory))
      } catch (err) {
        console.error(err)
        dispatch(setError(err))
      }
    }
  }

function buildZoneFeature(zone, newLayerName: string) {
  const featureObject = mapToRegulatoryFeatureObject({
    ...zone,
    topic: newLayerName
  })
  const feature = new Feature(featureObject)
  feature.setId(getRegulatoryFeatureId(zone.id))

  return feature
}

function mutateLayersTopicsWithNewTopic(
  layersTopicsByRegTerritory,
  territory: string,
  lawType: string,
  newTopic: string,
  oldTopic: string
) {
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
