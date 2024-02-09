import { deleteFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { setError } from '../../shared_slices/Global'

import type { FleetSegment } from '../../types/fleetSegment'

/**
 * Delete a fleet segment
 */
export const deleteFleetSegment = (segment: string, year: number) => dispatch =>
  deleteFleetSegmentFromAPI(segment, year)
    .then(updatedFleetSegments =>
      (Object.assign([], updatedFleetSegments) as FleetSegment[]).sort((a, b) => a.segment.localeCompare(b.segment))
    )
    .catch(error => {
      dispatch(setError(error))
    })
