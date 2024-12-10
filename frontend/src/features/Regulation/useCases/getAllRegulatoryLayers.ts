import { getAllRegulatoryLayersFromAPI } from '@api/geoserver'
import { layerActions } from '@features/Map/layer.slice'

import { setError } from '../../../domain/shared_slices/Global'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import { regulationActions } from '../slice'

import type { MainAppThunk } from '@store'

export const getAllRegulatoryLayers = (): MainAppThunk<Promise<void>> => async (dispatch, getState) => {
  const monitorFishWorker = await MonitorFishWorker
  const { speciesByCode } = getState().species

  try {
    const features = await getAllRegulatoryLayersFromAPI(getState().global.isBackoffice)

    const regulatoryZones = await monitorFishWorker.mapGeoserverToRegulatoryZones(features, speciesByCode)
    dispatch(regulationActions.setRegulatoryZones(regulatoryZones))

    const { layersTopicsByRegulatoryTerritory, layersWithoutGeometry } =
      await monitorFishWorker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features, speciesByCode)

    dispatch(regulationActions.setLayersTopicsByRegTerritory(layersTopicsByRegulatoryTerritory))
    dispatch(regulationActions.setRegulatoryLayerLawTypes(layersTopicsByRegulatoryTerritory))
    dispatch(regulationActions.setSelectedRegulatoryZone(layersWithoutGeometry))
    dispatch(layerActions.setShowedLayersWithLocalStorageValues(layersWithoutGeometry))
  } catch (error) {
    console.error(error)
    dispatch(setError(error))
  }
}
