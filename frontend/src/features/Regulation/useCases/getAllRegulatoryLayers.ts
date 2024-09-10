import { getAllRegulatoryLayersFromAPI } from '@api/geoserver'
import { setError } from '@features/MainWindow/slice'

import layer from '../../../domain/shared_slices/Layer'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import {
  setLayersTopicsByRegTerritory,
  setRegulatoryLayerLawTypes,
  setRegulatoryZones,
  setSelectedRegulatoryZone
} from '../slice'

import type { MainAppThunk } from '@store'

export const getAllRegulatoryLayers = (): MainAppThunk<Promise<void>> => async (dispatch, getState) => {
  const monitorFishWorker = await MonitorFishWorker
  const { setShowedLayersWithLocalStorageValues } = layer.homepage.actions
  const { speciesByCode } = getState().species

  try {
    const features = await getAllRegulatoryLayersFromAPI(getState().mainWindow.isBackoffice)

    monitorFishWorker.mapGeoserverToRegulatoryZones(features, speciesByCode).then(regulatoryZones => {
      dispatch(setRegulatoryZones(regulatoryZones))
    })

    const { layersTopicsByRegulatoryTerritory, layersWithoutGeometry } =
      await monitorFishWorker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features, speciesByCode)

    dispatch(setLayersTopicsByRegTerritory(layersTopicsByRegulatoryTerritory))
    dispatch(setRegulatoryLayerLawTypes(layersTopicsByRegulatoryTerritory))
    dispatch(setSelectedRegulatoryZone(layersWithoutGeometry))
    // TODO Investigate this dubious pattern/line of code.
    // @ts-ignore
    dispatch(setShowedLayersWithLocalStorageValues?.({ namespace: 'homepage', regulatoryZones: layersWithoutGeometry }))
  } catch (error) {
    console.error(error)
    dispatch(setError(error))
  }
}
