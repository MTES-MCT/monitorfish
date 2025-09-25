import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'
import { Feature } from 'ol'

import { sendRegulationTransaction } from '../../../api/geoserver'
import { regulationActions } from '../slice'
import { getRegulatoryFeatureId, mapToRegulatoryFeatureObject, RegulationActionType } from '../utils'

import type { BackofficeAppThunk } from '@store'

const UPDATE_TOPIC_NAME_ERROR = 'Une erreur est survenue lors la mise à jour de la thématique'

export const updateTopicForAllZones =
  (territory: string, lawType: string, oldLayerName: string, newLayerName: string): BackofficeAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { layersTopicsByRegTerritory } = getState().regulation
    if (!layersTopicsByRegTerritory?.[territory]?.[lawType]) {
      console.error(`${UPDATE_TOPIC_NAME_ERROR}
      One value is undefined:
      layersTopicsByRegTerritory is ${layersTopicsByRegTerritory}
      territory is ${territory}
      lawType is ${lawType}`)
      dispatch(
        addMainWindowBanner({
          children: UPDATE_TOPIC_NAME_ERROR,
          closingDelay: 3000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )

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
        dispatch(
          addMainWindowBanner({
            children: (err as Error).message,
            closingDelay: 3000,
            isClosable: true,
            level: Level.ERROR,
            withAutomaticClosing: true
          })
        )
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
