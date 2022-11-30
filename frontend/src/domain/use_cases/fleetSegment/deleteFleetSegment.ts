import { deleteFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { dayjs } from '../../../utils/dayjs'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { setError } from '../../shared_slices/Global'

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

      return updatedFleetSegments
    })
    .catch(error => {
      dispatch(setError(error))
    })
}
