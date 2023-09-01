import { fleetSegmentApi } from '../../../api/fleetSegment'

import type { MissionActionFormValues } from '../../../features/SideWindow/MissionForm/types'
import type { FleetSegment } from '../../types/fleetSegment'

export const getFleetSegments =
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
