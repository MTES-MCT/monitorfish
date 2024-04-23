import { updateFleetSegmentFromAPI } from '@features/FleetSegment/apis'

import { setError } from '../../MainWindow/slice'

import type { FleetSegment, UpdateFleetSegment } from '../types'

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
  async dispatch => {
    try {
      if (!segment || !year) {
        throw new Error('Erreur lors de la modification du segment de flotte')
      }

      const updatedFleetSegment = await updateFleetSegmentFromAPI(segment, year, updatedFields)

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
    .filter(existingSegment => existingSegment.segment !== segment)
    .concat(updatedFleetSegment)
    .sort((a, b) => a.segment.localeCompare(b.segment))
}
