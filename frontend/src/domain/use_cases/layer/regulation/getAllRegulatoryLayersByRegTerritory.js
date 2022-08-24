import { batch } from 'react-redux'

import { getAllRegulatoryLayersFromAPI } from '../../../../api/geoserver'
import { MonitorFishWorker } from '../../../../workers/MonitorFishWorker'
import { setError } from '../../../shared_slices/Global'
import { setLayersTopicsByRegTerritory, setRegulatoryLayerLawTypes } from '../../../shared_slices/Regulatory'

const getAllRegulatoryLayersByRegTerritory = () => async (dispatch, getState) => {
  const monitorFishWorker = await new MonitorFishWorker()
  const { speciesByCode } = getState().species

  return getAllRegulatoryLayersFromAPI(getState().global.inBackofficeMode)
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
