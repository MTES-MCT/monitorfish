import { Mission } from '@features/Mission/mission.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { MonitorEnvMissionAction } from '@features/Mission/monitorEnvMissionAction.types'

export type MissionActionWithSource = {
  actionDatetimeUtc?: string
  actionStartDateTimeUtc?: string
  actionType: MissionAction.MissionActionType | MonitorEnvMissionAction.MissionActionType
  index?: number
  source: Mission.MissionSource
}
