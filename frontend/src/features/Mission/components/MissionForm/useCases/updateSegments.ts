import { MissionAction } from '@features/Mission/missionAction.types'

import { getFleetSegments } from '../../../../../domain/use_cases/vessel/getFleetSegments'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { Option } from '@mtes-mct/monitor-ui'

export const updateSegments =
  (
    dispatch,
    setFieldValue: (field: string, value: any) => void,
    fleetSegmentsAsOptions: Option<MissionAction.FleetSegment>[]
  ) =>
  async (missionAction: MissionActionFormValues) => {
    if (missionAction.actionType === MissionAction.MissionActionType.AIR_CONTROL) {
      return
    }

    const computedFleetSegments = await dispatch(
      getFleetSegments(missionAction.faoAreas, missionAction.gearOnboard, missionAction.speciesOnboard)
    )

    const nextFleetSegments = fleetSegmentsAsOptions
      .filter(({ value }) => computedFleetSegments?.find(fleetSegment => fleetSegment.segment === value.segment))
      .map(({ value }) => value)

    setFieldValue('segments', nextFleetSegments)
  }
