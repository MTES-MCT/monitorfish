export namespace MonitorEnvMissionAction {
  export interface MissionAction {
    actionStartDateTimeUtc: string
    actionType: MissionActionType
  }

  // ---------------------------------------------------------------------------
  // Constants

  /* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
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

  /* eslint-enable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
}
