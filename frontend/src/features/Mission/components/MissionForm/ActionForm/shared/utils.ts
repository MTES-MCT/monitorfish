import { MissionAction } from '@features/Mission/missionAction.types'
import { getLocalizedDayjs } from '@mtes-mct/monitor-ui'

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

export function getNumberInFrench(aNumber: number): string {
  switch (aNumber) {
    case 1:
      return 'une'
    case 2:
      return 'deux'
    case 3:
      return 'trois'
    case 4:
      return 'quatre'
    case 5:
      return 'cinq'
    case 6:
      return 'six'
    case 7:
      return 'sept'
    case 8:
      return 'huit'
    case 9:
      return 'neuf'
    default:
      return String(aNumber)
  }
}
