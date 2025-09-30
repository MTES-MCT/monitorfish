import { fleetSegmentApi } from '@features/FleetSegment/apis'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import type { FleetSegment } from '../types'

/**
 * Update a fleet segment
 */
export const updateFleetSegment =
  (
    segment: string,
    updatedSegment: FleetSegment,
    previousFleetSegments: FleetSegment[]
  ): ((dispatch, getState) => Promise<FleetSegment[] | undefined>) =>
  async dispatch => {
    try {
      if (!segment) {
        throw new Error('Le champ segment est requis')
      }

      const updatedFleetSegment = await dispatch(
        fleetSegmentApi.endpoints.updateFleetSegment.initiate({
          segment,
          updatedSegment
        })
      ).unwrap()

      return updateFleetSegments(previousFleetSegments, segment, updatedFleetSegment)
    } catch (error) {
      dispatch(
        addMainWindowBanner({
          children: (error as Error).message,
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )

      return undefined
    }
  }

function updateFleetSegments(
  previousFleetSegments: FleetSegment[],
  segment: string,
  updatedFleetSegment: FleetSegment
): FleetSegment[] {
  return previousFleetSegments
    .filter(existingSegment => existingSegment.segment !== segment)
    .concat(updatedFleetSegment)
    .sort((a, b) => a.segment.localeCompare(b.segment))
}
