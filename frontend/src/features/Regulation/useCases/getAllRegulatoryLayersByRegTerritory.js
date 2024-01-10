import { batch } from 'react-redux'

import { getAllRegulatoryLayersFromAPI } from '../../../api/geoserver'
import { setError } from '../../../domain/shared_slices/Global'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import { setLayersTopicsByRegTerritory, setRegulatoryLayerLawTypes } from '../slice'

const getAllRegulatoryLayersByRegTerritory = () => async (dispatch, getState) => {
  const monitorFishWorker = await new MonitorFishWorker()
  const { speciesByCode } = getState().species

  return getAllRegulatoryLayersFromAPI(getState().global.isBackoffice)
    .then(features => monitorFishWorker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features, speciesByCode))
    .then(response => {
      const { layersTopicsByRegulatoryTerritory } = response

      batch(() => {
        dispatch(setLayersTopicsByRegTerritory(layersTopicsByRegulatoryTerritory))
        dispatch(setRegulatoryLayerLawTypes(layersTopicsByRegulatoryTerritory))
      })
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
    })
}

export default getAllRegulatoryLayersByRegTerritory
