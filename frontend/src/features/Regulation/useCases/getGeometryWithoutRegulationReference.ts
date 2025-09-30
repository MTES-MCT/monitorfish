import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { getAllGeometryWithoutProperty } from '../../../api/geoserver'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'

import type { Polygon } from 'geojson'

export const getGeometryWithoutRegulationReference =
  () =>
  async (dispatch, getState): Promise<Record<string, Polygon>> => {
    const monitorFishWorker = await MonitorFishWorker

    try {
      const features = await getAllGeometryWithoutProperty(getState().global.isBackoffice)

      return await monitorFishWorker.getIdToGeometryObject(features)
    } catch (e) {
      dispatch(
        addMainWindowBanner({
          children: (e as Error).message,
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
      throw e
    }
  }
