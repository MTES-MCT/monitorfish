import { getAllRegulatoryLayersFromAPI } from '../../../api/geoserver'
import { setError } from '../../../domain/shared_slices/Global'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import { regulationActions } from '../slice'

import type { BackofficeAppThunk } from '@store'

export const getAllRegulatoryLayersByRegTerritory =
  (): BackofficeAppThunk<Promise<void>> => async (dispatch, getState) => {
    const monitorFishWorker = await MonitorFishWorker
    const { speciesByCode } = getState().species
    const { layersTopicsByRegTerritory } = getState().regulation

    if (layersTopicsByRegTerritory && Object.keys(layersTopicsByRegTerritory).length > 0) {
      return
    }

    try {
      const features = await getAllRegulatoryLayersFromAPI(getState().global.isBackoffice)
      const { layersTopicsByRegulatoryTerritory } =
        await monitorFishWorker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features, speciesByCode)

      dispatch(regulationActions.setLayersTopicsByRegTerritory(layersTopicsByRegulatoryTerritory))
      dispatch(regulationActions.setRegulatoryLayerLawTypes(layersTopicsByRegulatoryTerritory))
    } catch (error) {
      dispatch(setError(error))

      throw error
    }
  }
