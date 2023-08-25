import { batch } from 'react-redux'
import { setError } from '../../../shared_slices/Global'
import {
  setLayersTopicsByRegTerritory,
  setRegulatoryLayerLawTypes,
  setRegulatoryZones,
  setSelectedRegulatoryZone
} from '../../../shared_slices/Regulatory'
import layer from '../../../shared_slices/Layer'
import { getAllRegulatoryLayersFromAPI } from '../../../../api/geoserver'
import { MonitorFishWorker } from '../../../../workers/MonitorFishWorker'

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
      const {
        layersWithoutGeometry,
        layersTopicsByRegulatoryTerritory
      } = response
      batch(() => {
        dispatch(setLayersTopicsByRegTerritory(layersTopicsByRegulatoryTerritory))
        dispatch(setRegulatoryLayerLawTypes(layersTopicsByRegulatoryTerritory))
        dispatch(setSelectedRegulatoryZone(layersWithoutGeometry))
        dispatch(setShowedLayersWithLocalStorageValues({ regulatoryZones: layersWithoutGeometry, namespace: 'homepage' }))
      })
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
    })
}

export default getAllRegulatoryLayers
