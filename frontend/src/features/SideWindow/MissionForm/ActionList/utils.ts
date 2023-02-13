import { getUtcizedDayjs } from '@mtes-mct/monitor-ui'

import type { MissionAction } from '../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../types'

export function formatDateLabel(dateLabel: string) {
  return dateLabel.replace(
    /([a-z])([a-zéû]+)\.?$/,
    (_, firstMatch, secondMatch) => `${firstMatch.toLocaleUpperCase()}${secondMatch}`
  )
}

export function getMissionActionFormInitialValues(type: MissionAction.MissionActionType): MissionActionFormValues {
  return {
    actionDatetimeUtc: getUtcizedDayjs(new Date()).toISOString(),
    actionType: type,
    isDraft: true,
    vesselTargeted: false
  }
}
