import { deleteFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { setError } from '../../shared_slices/Global'

/**
 * Delete a fleet segment
 * @param {string} segment - The segment
 */
const deleteFleetSegment = segment => (dispatch, getState) => {
  const previousFleetSegments = Object.assign([], getState().fleetSegment.fleetSegments).sort((a, b) =>
    a.segment.localeCompare(b.segment)
  )
  const nextFleetSegments = previousFleetSegments.filter(_segment => _segment.segment !== segment)
  dispatch(setFleetSegments(nextFleetSegments))

  return deleteFleetSegmentFromAPI(segment).catch(error => {
    dispatch(setFleetSegments(previousFleetSegments))
    dispatch(setError(error))
  })
}

export default deleteFleetSegment
