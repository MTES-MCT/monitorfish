import { batch } from 'react-redux'

import { getAllRegulatoryLayersFromAPI } from '../../../../api/geoserver'
import { MonitorFishWorker } from '../../../../workers/MonitorFishWorker'
import { setError } from '../../../shared_slices/Global'
import layer from '../../../shared_slices/Layer'
import {
  setSelectedRegulatoryZone,
  setLayersTopicsByRegTerritory,
  setRegulatoryLayerLawTypes,
} from '../../../shared_slices/Regulatory'

const getAllRegulatoryLayers = () => async (dispatch, getState) => {
  const monitorFishWorker = await new MonitorFishWorker()
  const { setShowedLayersWithLocalStorageValues } = layer.homepage.actions
  const { speciesByCode } = getState().species

  return getAllRegulatoryLayersFromAPI(getState().global.inBackofficeMode)
    .then(features => monitorFishWorker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features, speciesByCode))
    .then(response => {
      const { layersTopicsByRegulatoryTerritory, layersWithoutGeometry } = response
      batch(() => {
        dispatch(setLayersTopicsByRegTerritory(layersTopicsByRegulatoryTerritory))
        dispatch(setRegulatoryLayerLawTypes(layersTopicsByRegulatoryTerritory))
        dispatch(setSelectedRegulatoryZone(layersWithoutGeometry))
        dispatch(
          setShowedLayersWithLocalStorageValues({ namespace: 'homepage', regulatoryZones: layersWithoutGeometry }),
        )
      })
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
    })
}

export default getAllRegulatoryLayers
