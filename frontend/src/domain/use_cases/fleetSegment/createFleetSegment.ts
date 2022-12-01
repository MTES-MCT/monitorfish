import { createFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { dayjs } from '../../../utils/dayjs'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { setError } from '../../shared_slices/Global'

import type { FleetSegment, UpdateFleetSegment } from '../../types/fleetSegment'

/**
 * Create a fleet segment
 */
export const createFleetSegment =
  (segmentFields: UpdateFleetSegment, previousFleetSegments: FleetSegment[]) =>
  async (dispatch, getState): Promise<undefined | FleetSegment[]> => {
    if (!segmentFields?.segment) {
      const returnedError = new Error("Le segment de flotte n'a pas de nom")
      dispatch(setError(returnedError))
      throw returnedError
    }
    if (!segmentFields?.year) {
      const returnedError = new Error("Le segment de flotte n'a pas d'année")
      dispatch(setError(returnedError))
      throw returnedError
    }

    const currentYear = dayjs().year()
    const previousFleetSegmentsOfCurrentYear = Object.assign([], getState().fleetSegment.fleetSegments)

    try {
      const newSegment = await createFleetSegmentFromAPI(segmentFields)
      if (segmentFields.year === currentYear) {
        const nextFleetSegments = addFleetSegments(previousFleetSegmentsOfCurrentYear, newSegment)
        dispatch(setFleetSegments(nextFleetSegments))
      }

      return addFleetSegments(previousFleetSegments, newSegment)
    } catch (error) {
      dispatch(setError(error))

      return undefined
    }
  }

function addFleetSegments(previousFleetSegments: FleetSegment[], updatedFleetSegment: FleetSegment): FleetSegment[] {
  return previousFleetSegments.concat(updatedFleetSegment).sort((a, b) => a.segment.localeCompare(b.segment))
}
