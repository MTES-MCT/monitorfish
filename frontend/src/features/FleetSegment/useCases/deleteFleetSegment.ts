import { fleetSegmentApi } from '@features/FleetSegment/apis'

import { setError } from '../../../domain/shared_slices/Global'

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
      dispatch(setError(e))

      return undefined
    }
  }
