import type { MissionActionFormValues, MissionMainFormValues } from '@features/Mission/components/MissionForm/types'

export type MissionWithActionsDraft = {
  actionsFormValues: MissionActionFormValues[]
  mainFormValues: MissionMainFormValues
}

export enum MonitorEnvMissionActionType {
  CONTROL = 'CONTROL',
  DETACHED_REPORTING = 'DETACHED_REPORTING',
  NOTE = 'NOTE',
  REPORTING = 'REPORTING',
  SURVEILLANCE = 'SURVEILLANCE'
}

export const MONITORENV_MISSION_ACTION_TYPE_LABEL: Record<MonitorEnvMissionActionType, string> = {
  CONTROL: 'Contrôle',
  NOTE: 'Note',
  SURVEILLANCE: 'Surveillance'
}
