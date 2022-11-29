import { updateFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { dayjs } from '../../../utils/dayjs'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { setError } from '../../shared_slices/Global'

import type { UpdateFleetSegment } from '../../types/fleetSegment'

/**
 * Update a fleet segment
 */
export const updateFleetSegment =
  (segment: string, year: number, updatedFields: UpdateFleetSegment) => (dispatch, getState) => {
    if (!segment || !year) {
      dispatch(setError(new Error('Erreur lors de la modification du segment de flotte')))
    }

    const currentYear = dayjs().year()
    const previousFleetSegments = Object.assign([], getState().fleetSegment.fleetSegments)

    return updateFleetSegmentFromAPI(segment, year, updatedFields)
      .then(updatedFleetSegment => {
        if (year === currentYear) {
          const nextFleetSegments = updateFleetSegments(previousFleetSegments, segment, updatedFleetSegment).sort(
            (a, b) => a.segment.localeCompare(b.segment)
          )
          dispatch(setFleetSegments(nextFleetSegments))
        }

        return updatedFleetSegment
      })
      .catch(error => {
        console.log('HIHIHI')
        dispatch(setError(error))
      })
  }

function updateFleetSegments(previousFleetSegments, segment, updatedFleetSegment) {
  const nextFleetSegments = previousFleetSegments.filter(_segment => _segment.segment !== segment)

  return nextFleetSegments.concat(updatedFleetSegment)
}
