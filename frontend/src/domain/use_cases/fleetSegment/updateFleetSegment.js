import { updateFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { setError } from '../../shared_slices/Global'

/**
 * Update a fleet segment
 * @memberOf API
 * @param {string} segment - The fleet segment
 * @param {UpdateFleetSegment} updatedFields - The fields to update
 * @throws {Error}
 */
const updateFleetSegment = (segment, updatedFields) => (dispatch, getState) => {
  if (!segment) {
    dispatch(setError(new Error('Erreur lors de la modification du segment de flotte')))

    return
  }
  const previousFleetSegments = Object.assign([], getState().fleetSegment.fleetSegments)
  const nextFleetSegments = updateFleetSegments(previousFleetSegments, segment, updatedFields)
  dispatch(setFleetSegments(nextFleetSegments.sort((a, b) => a.segment.localeCompare(b.segment))))

  updateFleetSegmentFromAPI(segment, updatedFields).catch(error => {
    dispatch(setFleetSegments(previousFleetSegments.sort((a, b) => a.segment.localeCompare(b.segment))))
    dispatch(setError(error))
  })
}

function updateFleetSegments(previousFleetSegments, segment, updatedFields) {
  const fleetSegmentToUpdate = { ...previousFleetSegments.find(_segment => _segment.segment === segment) }

  Object.keys(updatedFields).forEach(key => {
    if (updatedFields[key] || updatedFields[key] === 0) {
      fleetSegmentToUpdate[key] = updatedFields[key]
    }
  })

  let nextFleetSegments = previousFleetSegments.filter(_segment => _segment.segment !== segment)
  nextFleetSegments = nextFleetSegments.concat(fleetSegmentToUpdate)

  return nextFleetSegments
}

export default updateFleetSegment
