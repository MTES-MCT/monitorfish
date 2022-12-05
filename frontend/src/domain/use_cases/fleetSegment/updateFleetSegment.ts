import { updateFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { dayjs } from '../../../utils/dayjs'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { setError } from '../../shared_slices/Global'

import type { FleetSegment, UpdateFleetSegment } from '../../types/fleetSegment'

/**
 * Update a fleet segment
 */
export const updateFleetSegment =
  (
    segment: string,
    year: number,
    updatedFields: UpdateFleetSegment,
    previousFleetSegments: FleetSegment[]
  ): ((dispatch, getState) => Promise<FleetSegment[] | undefined>) =>
  async (dispatch, getState) => {
    try {
      if (!segment || !year) {
        throw new Error('Erreur lors de la modification du segment de flotte')
      }

      const currentYear = dayjs().year()
      const previousFleetSegmentsOfCurrentYear = Object.assign([], getState().fleetSegment.fleetSegments)

      const updatedFleetSegment = await updateFleetSegmentFromAPI(segment, year, updatedFields)
      if (year === currentYear) {
        const nextFleetSegments = updateFleetSegments(previousFleetSegmentsOfCurrentYear, segment, updatedFleetSegment)
        dispatch(setFleetSegments(nextFleetSegments))
      }

      return updateFleetSegments(previousFleetSegments, segment, updatedFleetSegment)
    } catch (error) {
      dispatch(setError(error))

      return undefined
    }
  }

function updateFleetSegments(
  previousFleetSegments: FleetSegment[],
  segment: string,
  updatedFleetSegment: FleetSegment
): FleetSegment[] {
  return previousFleetSegments
    .filter(_segment => _segment.segment !== segment)
    .concat(updatedFleetSegment)
    .sort((a, b) => a.segment.localeCompare(b.segment))
}
