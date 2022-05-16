import { setError } from '../../shared_slices/Global'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { createFleetSegmentFromAPI } from '../../../api/fleetSegment'

/**
 * Create a fleet segment
 * @memberOf API
 * @param {UpdateFleetSegment} segmentFields - The fields of the fleet segment
 * @throws {Error}
 */
const createFleetSegment = (segmentFields) => (dispatch, getState) => {
  if (!segmentFields?.segment) {
    dispatch(setError(new Error('Le segment de flotte n\'a pas de nom')))
    return
  }
  const previousFleetSegments = Object.assign([], getState().fleetSegment.fleetSegments)
  const nextFleetSegments = previousFleetSegments.concat(segmentFields)
  dispatch(setFleetSegments(nextFleetSegments
    .sort((a, b) => a.segment.localeCompare(b.segment))))

  return createFleetSegmentFromAPI(segmentFields).catch(error => {
    dispatch(setFleetSegments(previousFleetSegments
      .sort((a, b) => a.segment.localeCompare(b.segment))))
    dispatch(setError(error))
  })
}

export default createFleetSegment
