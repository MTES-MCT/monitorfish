import { getLocalizedDayjs } from '@mtes-mct/monitor-ui'
import { MissionAction } from 'domain/types/missionAction'

import type { FleetSegment } from '@features/FleetSegment/types'
import type { Option } from '@mtes-mct/monitor-ui'

export function getTitleDateFromUtcStringDate(utcStringDate: string): string {
  return getLocalizedDayjs(utcStringDate).format('D MMM à HH:mm UTC')
}

export function getFleetSegmentsAsOption(
  getFleetSegmentsApiQuery: FleetSegment[] | undefined
): Option<MissionAction.FleetSegment>[] {
  if (!getFleetSegmentsApiQuery) {
    return []
  }

  return getFleetSegmentsApiQuery.map(({ segment, segmentName }) => ({
    label: `${segment} - ${segmentName}`,
    value: {
      segment,
      segmentName: segmentName ?? undefined
    }
  }))
}
