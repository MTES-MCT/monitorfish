import { getAllRegulatoryLayersFromAPI } from '../../../api/geoserver'
import { setError } from '../../../domain/shared_slices/Global'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import { setLayersTopicsByRegTerritory, setRegulatoryLayerLawTypes } from '../slice'

export const getAllRegulatoryLayersByRegTerritory = () => async (dispatch, getState) => {
  const monitorFishWorker = await MonitorFishWorker
  const { speciesByCode } = getState().species
  const { layersTopicsByRegTerritory } = getState().regulatory

  if (layersTopicsByRegTerritory && Object.keys(layersTopicsByRegTerritory).length > 0) {
    return
  }

  try {
    const features = await getAllRegulatoryLayersFromAPI(getState().global.isBackoffice)
    const { layersTopicsByRegulatoryTerritory } =
      await monitorFishWorker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features, speciesByCode)

    dispatch(setLayersTopicsByRegTerritory(layersTopicsByRegulatoryTerritory))
    dispatch(setRegulatoryLayerLawTypes(layersTopicsByRegulatoryTerritory))
  } catch (error) {
    dispatch(setError(error))

    throw error
  }
}
