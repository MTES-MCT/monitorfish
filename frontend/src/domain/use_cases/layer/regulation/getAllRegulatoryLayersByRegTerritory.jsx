import { batch } from 'react-redux'
import { setError } from '../../../shared_slices/Global'
import {
  setLayersTopicsByRegTerritory,
  setRegulatoryLayerLawTypes
} from '../../../shared_slices/Regulatory'
import { getAllRegulatoryLayersFromAPI } from '../../../../api/geoserver'
import { MonitorFishWorker } from '../../../../workers/MonitorFishWorker'

const getAllRegulatoryLayersByRegTerritory = () => async (dispatch, getState) => {
  const monitorFishWorker = await new MonitorFishWorker()
  const { speciesByCode } = getState().species

  return getAllRegulatoryLayersFromAPI(getState().global.isBackoffice)
    .then(features => {
      return monitorFishWorker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features, speciesByCode)
    })
    .then(response => {
      const {
        layersTopicsByRegulatoryTerritory
      } = response

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
