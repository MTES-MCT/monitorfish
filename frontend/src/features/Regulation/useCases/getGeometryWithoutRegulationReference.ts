import { getAllGeometryWithoutProperty } from '../../../api/geoserver'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import { setError } from '../../MainWindow/slice'

import type { GeoJSON } from '../../../domain/types/GeoJSON'

export const getGeometryWithoutRegulationReference =
  () =>
  async (dispatch, getState): Promise<Record<string, GeoJSON.Geometry>> => {
    const monitorFishWorker = await MonitorFishWorker

    try {
      const features = await getAllGeometryWithoutProperty(getState().mainWindow.isBackoffice)

      return await monitorFishWorker.getIdToGeometryObject(features)
    } catch (e) {
      dispatch(setError(e))

      throw e
    }
  }
