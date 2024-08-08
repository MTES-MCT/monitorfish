import { fleetSegmentApi } from '@features/FleetSegment/apis'

import type { FleetSegment } from '@features/FleetSegment/types'
import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

export const computeFleetSegments =
  (
    faoAreas: string[] | undefined,
    gearOnBoard: MissionActionFormValues['gearOnboard'],
    speciesOnboard: MissionActionFormValues['speciesOnboard']
  ) =>
  async (dispatch): Promise<FleetSegment[]> => {
    if (!gearOnBoard?.length && !speciesOnboard?.length) {
      return []
    }

    const gears = gearOnBoard?.map(gear => gear.gearCode)
    const species = speciesOnboard?.map(specy => specy.speciesCode)

    const { data: fleetSegments } = await dispatch(
      fleetSegmentApi.endpoints.computeFleetSegments.initiate({
        faoAreas: faoAreas || [],
        gears: gears || [],
        species: species || []
      })
    )

    return fleetSegments
  }
