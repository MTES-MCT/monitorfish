import { deleteFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { dayjs } from '../../../utils/dayjs'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { setError } from '../../shared_slices/Global'

import type { FleetSegment } from '../../types/fleetSegment'

/**
 * Delete a fleet segment
 */
export const deleteFleetSegment = (segment: string, year: number) => dispatch => {
  const currentYear = dayjs().year()

  return deleteFleetSegmentFromAPI(segment, year)
    .then(updatedFleetSegments => {
      if (year === currentYear) {
        dispatch(setFleetSegments(updatedFleetSegments))
      }

      return (Object.assign([], updatedFleetSegments) as FleetSegment[]).sort((a, b) =>
        a.segment.localeCompare(b.segment)
      )
    })
    .catch(error => {
      dispatch(setError(error))
    })
}
