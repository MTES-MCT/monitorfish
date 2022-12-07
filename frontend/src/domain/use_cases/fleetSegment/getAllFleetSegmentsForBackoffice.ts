import { getAllFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { setError } from '../../shared_slices/Global'

import type { FleetSegment } from '../../types/fleetSegment'

export const getAllFleetSegmentsForBackoffice =
  (year?: number) =>
  (dispatch): Promise<void | FleetSegment[]> =>
    getAllFleetSegmentFromAPI(year)
      .then(fleetSegments => fleetSegments.sort((a, b) => a.segment.localeCompare(b.segment)))
      .catch(error => {
        dispatch(setError(error))
      })
