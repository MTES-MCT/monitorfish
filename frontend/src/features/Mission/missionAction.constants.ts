/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
export namespace MissionAction {
  export enum ControlCheck {
    NO = 'NO',
    NOT_APPLICABLE = 'NOT_APPLICABLE',
    YES = 'YES'
  }

  export enum FlightGoal {
    VMS_AIS_CHECK = 'VMS_AIS_CHECK',
    UNAUTHORIZED_FISHING = 'UNAUTHORIZED_FISHING',
    CLOSED_AREA = 'CLOSED_AREA'
  }

  export const FLIGHT_GOAL_LABEL: Record<FlightGoal, string> = {
    VMS_AIS_CHECK: 'Vérifications VMS/AIS',
    UNAUTHORIZED_FISHING: 'Pêche sans autorisation',
    CLOSED_AREA: 'Zones fermées'
  }

  export enum InfractionType {
    WITH_RECORD = 'WITH_RECORD',
    WITHOUT_RECORD = 'WITHOUT_RECORD',
    PENDING = 'PENDING'
  }

  export const INFRACTION_TYPE_LABEL: Record<InfractionType, string> = {
    [InfractionType.WITH_RECORD]: 'Avec PV',
    [InfractionType.WITHOUT_RECORD]: 'Sans PV',
    [InfractionType.PENDING]: 'En attente'
  }

  export enum MissionActionType {
    AIR_CONTROL = 'AIR_CONTROL',
    AIR_SURVEILLANCE = 'AIR_SURVEILLANCE',
    LAND_CONTROL = 'LAND_CONTROL',
    OBSERVATION = 'OBSERVATION',
    SEA_CONTROL = 'SEA_CONTROL'
  }

  export enum CompletionStatus {
    COMPLETED = 'COMPLETED',
    TO_COMPLETE = 'TO_COMPLETE'
  }
}
/* eslint-enable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
