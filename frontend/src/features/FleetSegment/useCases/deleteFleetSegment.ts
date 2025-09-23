import { addBackOfficeBanner } from '@features/BackOffice/useCases/addBackOfficeBanner'
import { fleetSegmentApi } from '@features/FleetSegment/apis'
import { Level } from '@mtes-mct/monitor-ui'

import type { FleetSegment } from '../types'

/**
 * Delete a fleet segment
 */
export const deleteFleetSegment =
  (segment: string, year: number) =>
  async (dispatch): Promise<undefined | FleetSegment[]> => {
    try {
      const updatedFleetSegments = await dispatch(
        fleetSegmentApi.endpoints.deleteFleetSegment.initiate({ segment, year })
      ).unwrap()

      return (Object.assign([], updatedFleetSegments) as FleetSegment[]).sort((a, b) =>
        a.segment.localeCompare(b.segment)
      )
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

      return undefined
    }
  }
