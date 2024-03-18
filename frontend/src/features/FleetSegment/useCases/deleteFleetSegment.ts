import { deleteFleetSegmentFromAPI } from '@features/FleetSegment/apis'

import { setError } from '../../../domain/shared_slices/Global'

import type { FleetSegment } from '../types'

/**
 * Delete a fleet segment
 */
export const deleteFleetSegment =
  (segment: string, year: number) =>
  async (dispatch): Promise<undefined | FleetSegment[]> => {
    try {
      const updatedFleetSegments = await deleteFleetSegmentFromAPI(segment, year)

      return (Object.assign([], updatedFleetSegments) as FleetSegment[]).sort((a, b) =>
        a.segment.localeCompare(b.segment)
      )
    } catch (e) {
      dispatch(setError(e))

      return undefined
    }
  }
