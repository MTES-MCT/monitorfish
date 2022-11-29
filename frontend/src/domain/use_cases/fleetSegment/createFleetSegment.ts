import { createFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { dayjs } from '../../../utils/dayjs'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { setError } from '../../shared_slices/Global'

import type { UpdateFleetSegment } from '../../types/fleetSegment'

/**
 * Create a fleet segment
 */
export const createFleetSegment = (segmentFields: UpdateFleetSegment) => (dispatch, getState) => {
  if (!segmentFields?.segment) {
    dispatch(setError(new Error("Le segment de flotte n'a pas de nom")))

    return undefined
  }
  if (!segmentFields?.year) {
    dispatch(setError(new Error("Le segment de flotte n'a pas d'année")))

    return undefined
  }

  const currentYear = dayjs().year()
  const previousFleetSegments = Object.assign([], getState().fleetSegment.fleetSegments)

  return createFleetSegmentFromAPI(segmentFields)
    .then(newSegment => {
      if (segmentFields.year === currentYear) {
        const nextFleetSegments = previousFleetSegments
          .concat(newSegment)
          .sort((a, b) => a.segment.localeCompare(b.segment))
        dispatch(setFleetSegments(nextFleetSegments))
      }
    })
    .catch(error => {
      dispatch(setError(error))
    })
}
