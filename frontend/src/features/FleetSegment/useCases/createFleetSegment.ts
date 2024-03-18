import { createFleetSegmentFromAPI } from '@features/FleetSegment/apis'

import { setError } from '../../../domain/shared_slices/Global'

import type { FleetSegment, UpdateFleetSegment } from '../types'

/**
 * Create a fleet segment
 */
export const createFleetSegment =
  (segmentFields: UpdateFleetSegment, previousFleetSegments: FleetSegment[]) =>
  async (dispatch): Promise<undefined | FleetSegment[]> => {
    try {
      if (!segmentFields?.segment) {
        throw new Error("Le segment de flotte n'a pas de nom")
      }
      if (!segmentFields?.year) {
        throw new Error("Le segment de flotte n'a pas d'année")
      }

      const newSegment = await createFleetSegmentFromAPI(segmentFields)

      return addFleetSegments(previousFleetSegments, newSegment)
    } catch (error) {
      dispatch(setError(error))

      return undefined
    }
  }

function addFleetSegments(previousFleetSegments: FleetSegment[], updatedFleetSegment: FleetSegment): FleetSegment[] {
  return previousFleetSegments.concat(updatedFleetSegment).sort((a, b) => a.segment.localeCompare(b.segment))
}
