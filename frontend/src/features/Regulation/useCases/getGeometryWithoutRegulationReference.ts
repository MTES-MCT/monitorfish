import { addBackOfficeBanner } from '@features/BackOffice/useCases/addBackOfficeBanner'
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
        addBackOfficeBanner({
          children: (e as Error).message,
          closingDelay: 3000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
      throw e
    }
  }
