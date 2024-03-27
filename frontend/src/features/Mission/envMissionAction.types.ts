import { Mission } from '@features/Mission/mission.types'

export namespace EnvMissionAction {
  export interface MissionAction {
    actionStartDateTimeUtc?: string
    actionType: MissionActionType
    id: number
  }

  // ---------------------------------------------------------------------------
  // Constants

  export enum MissionActionType {
    CONTROL = 'CONTROL',
    NOTE = 'NOTE',
    SURVEILLANCE = 'SURVEILLANCE'
  }

  export const MISSION_ACTION_TYPE_LABEL: Record<MissionActionType, string> = {
    CONTROL: 'Contrôle',
    NOTE: 'Note',
    SURVEILLANCE: 'Surveillance'
  }

  export type MissionActionForTimeline = MissionAction & {
    actionDatetimeUtc?: string | undefined
    index?: number
    source: Mission.MissionSource
  }
}
