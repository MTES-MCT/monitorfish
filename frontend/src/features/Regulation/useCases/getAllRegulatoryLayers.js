import { batch } from 'react-redux'

import { getAllRegulatoryLayersFromAPI } from '../../../api/geoserver'
import { setError } from '../../../domain/shared_slices/Global'
import layer from '../../../domain/shared_slices/Layer'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import {
  setLayersTopicsByRegTerritory,
  setRegulatoryLayerLawTypes,
  setRegulatoryZones,
  setSelectedRegulatoryZone
} from '../slice'

const getAllRegulatoryLayers = () => async (dispatch, getState) => {
  const monitorFishWorker = await new MonitorFishWorker()
  const { setShowedLayersWithLocalStorageValues } = layer.homepage.actions
  const { speciesByCode } = getState().species

  return getAllRegulatoryLayersFromAPI(getState().global.isBackoffice)
    .then(features => {
      monitorFishWorker.mapGeoserverToRegulatoryZones(features, speciesByCode).then(regulatoryZones => {
        dispatch(setRegulatoryZones(regulatoryZones))
      })

      return monitorFishWorker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features, speciesByCode)
    })
    .then(response => {
      const { layersTopicsByRegulatoryTerritory, layersWithoutGeometry } = response
      batch(() => {
        dispatch(setLayersTopicsByRegTerritory(layersTopicsByRegulatoryTerritory))
        dispatch(setRegulatoryLayerLawTypes(layersTopicsByRegulatoryTerritory))
        dispatch(setSelectedRegulatoryZone(layersWithoutGeometry))
        dispatch(
          setShowedLayersWithLocalStorageValues({ namespace: 'homepage', regulatoryZones: layersWithoutGeometry })
        )
      })
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
    })
}

export default getAllRegulatoryLayers
