import { computeFleetSegments } from '@features/FleetSegment/useCases/computeFleetSegments'
import { MissionAction } from '@features/Mission/missionAction.types'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { Option } from '@mtes-mct/monitor-ui'

export const updateActionSegments =
  (
    dispatch,
    setFieldValue: (field: string, value: any) => void,
    fleetSegmentsAsOptions: Option<MissionAction.FleetSegment>[]
  ) =>
  async (missionAction: MissionActionFormValues) => {
    if (missionAction.actionType === MissionAction.MissionActionType.AIR_CONTROL) {
      return
    }

    if (missionAction.vesselId === undefined) {
      return
    }

    const computedFleetSegments = await dispatch(
      computeFleetSegments(
        missionAction.faoAreas,
        missionAction.gearOnboard,
        missionAction.speciesOnboard,
        missionAction.vesselId
      )
    )

    const nextFleetSegments = fleetSegmentsAsOptions
      .filter(({ value }) => computedFleetSegments?.find(fleetSegment => fleetSegment.segment === value.segment))
      .map(({ value }) => value)

    setFieldValue('segments', nextFleetSegments)
  }
