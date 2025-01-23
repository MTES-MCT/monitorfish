import { computeFleetSegments } from '@features/FleetSegment/useCases/computeFleetSegments'
import { MissionAction } from '@features/Mission/missionAction.types'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { FleetSegment } from '@features/FleetSegment/types'
import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

export const updateActionSegments =
  (dispatch, setFieldValue: (field: string, value: any) => void) => async (missionAction: MissionActionFormValues) => {
    if (missionAction.actionType === MissionAction.MissionActionType.AIR_CONTROL) {
      return
    }

    const year = missionAction.actionDatetimeUtc ? customDayjs(missionAction.actionDatetimeUtc).get('year') : undefined

    const computedFleetSegments: FleetSegment[] = await dispatch(
      computeFleetSegments(
        missionAction.faoAreas,
        missionAction.gearOnboard,
        missionAction.speciesOnboard,
        missionAction.vesselId,
        year
      )
    )

    const nextFleetSegments = computedFleetSegments.map(segment => ({
      segment: segment.segment,
      segmentName: segment.segmentName
    }))

    setFieldValue('segments', nextFleetSegments)
  }
