import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { fleetSegmentApi } from '@features/FleetSegment/apis'

import type { FleetSegment } from '@features/FleetSegment/types'
import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

export const computeFleetSegments =
  (
    faoAreas: string[] | undefined,
    gearOnBoard: MissionActionFormValues['gearOnboard'],
    speciesOnboard: MissionActionFormValues['speciesOnboard'],
    vesselId: number
  ) =>
  async (dispatch): Promise<FleetSegment[]> => {
    if (!gearOnBoard?.length && !speciesOnboard?.length) {
      return []
    }

    const { data: fleetSegments } = await dispatch(
      fleetSegmentApi.endpoints.computeFleetSegments.initiate(
        {
          faoAreas: faoAreas ?? [],
          gears: gearOnBoard ?? [],
          species: speciesOnboard ?? [],
          vesselId
        },
        RTK_FORCE_REFETCH_QUERY_OPTIONS
      )
    )

    return fleetSegments
  }
