import { updateFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { dayjs } from '../../../utils/dayjs'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { setError } from '../../shared_slices/Global'

import type { FleetSegment, UpdateFleetSegment } from '../../types/fleetSegment'

/**
 * Update a fleet segment
 */
export const updateFleetSegment =
  (segment: string, year: number, updatedFields: UpdateFleetSegment, previousFleetSegments: FleetSegment[]) =>
  (dispatch, getState) => {
    if (!segment || !year) {
      dispatch(setError(new Error('Erreur lors de la modification du segment de flotte')))
    }

    const currentYear = dayjs().year()
    const previousFleetSegmentsOfCurrentYear = Object.assign([], getState().fleetSegment.fleetSegments)

    return updateFleetSegmentFromAPI(segment, year, updatedFields)
      .then(updatedFleetSegment => {
        if (year === currentYear) {
          const nextFleetSegments = updateFleetSegments(
            previousFleetSegmentsOfCurrentYear,
            segment,
            updatedFleetSegment
          )
          dispatch(setFleetSegments(nextFleetSegments))
        }

        return updateFleetSegments(previousFleetSegments, segment, updatedFleetSegment)
      })
      .catch(error => {
        dispatch(setError(error))
      })
  }

function updateFleetSegments(previousFleetSegments, segment, updatedFleetSegment) {
  return previousFleetSegments
    .filter(_segment => _segment.segment !== segment)
    .concat(updatedFleetSegment)
    .sort((a, b) => a.segment.localeCompare(b.segment))
}
