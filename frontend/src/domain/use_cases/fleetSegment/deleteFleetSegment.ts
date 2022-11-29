import { deleteFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { dayjs } from '../../../utils/dayjs'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { setError } from '../../shared_slices/Global'

/**
 * Delete a fleet segment
 */
export const deleteFleetSegment = (segment: string, year: number) => (dispatch, getState) => {
  const previousFleetSegments = Object.assign([], getState().fleetSegment.fleetSegments).sort((a, b) =>
    a.segment.localeCompare(b.segment)
  )
  const currentYear = dayjs().year()

  return deleteFleetSegmentFromAPI(segment, year)
    .then(() => {
      if (year === currentYear) {
        const nextFleetSegments = previousFleetSegments.filter(_segment => _segment.segment !== segment)
        dispatch(setFleetSegments(nextFleetSegments))
      }
    })
    .catch(error => {
      dispatch(setFleetSegments(previousFleetSegments))
      dispatch(setError(error))
    })
}
