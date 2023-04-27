import type { SeaFrontGroup } from '../../../constants'
import type { ControlUnit } from '../../types/controlUnit'
import type { GeoJSON } from '../../types/GeoJSON'
import type { MissionAction } from '../../types/missionAction'
import type { Except } from 'type-fest'

export namespace Mission {
  export interface Mission {
    closedBy?: string
    controlUnits: ControlUnit.ControlUnit[]
    endDateTimeUtc?: string
    facade?: SeaFrontGroup
    geom?: GeoJSON.MultiPolygon
    id: number
    isClosed: boolean
    missionSource: MissionSource
    missionTypes: MissionType[]
    observationsCacem?: string
    observationsCnsp?: string
    openBy?: string
    startDateTimeUtc: string
  }

  // ---------------------------------------------------------------------------
  // Constants

  export enum MissionSource {
    MONITORENV = 'MONITORENV',
    MONITORFISH = 'MONITORFISH',
    POSEIDON_CACEM = 'POSEIDON_CACEM',
    POSEIDON_CNSP = 'POSEIDON_CNSP'
  }
  export enum MissionSourceLabel {
    MONITORENV = 'CACEM',
    MONITORFISH = 'CNSP',
    POSEIDON_CACEM = 'CACEM (Poseidon)',
    POSEIDON_CNSP = 'CNSP (Poseidon)'
  }
  export enum MissionSourceLabelWithoutPoseidon {
    MONITORENV = 'CACEM',
    MONITORFISH = 'CNSP'
  }

  /* eslint-disable typescript-sort-keys/string-enum */
  export enum MissionStatus {
    UPCOMING = 'UPCOMING',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
    CLOSED = 'CLOSED'
  }
  export enum MissionStatusLabel {
    UPCOMING = 'À venir',
    IN_PROGRESS = 'En cours',
    DONE = 'Terminée',
    CLOSED = 'Clôturée'
  }
  /* eslint-enable typescript-sort-keys/string-enum */

  /* eslint-disable typescript-sort-keys/string-enum */
  export enum MissionType {
    SEA = 'SEA',
    LAND = 'LAND',
    AIR = 'AIR'
  }
  export enum MissionTypeLabel {
    SEA = 'Mer',
    LAND = 'Terre',
    AIR = 'Air'
  }
  /* eslint-enable typescript-sort-keys/string-enum */

  // ---------------------------------------------------------------------------
  // Types

  export type MissionData = Except<Mission, 'id'>

  export type MissionPointFeatureProperties = {
    color: string
    controlUnits: ControlUnit.ControlUnit[]
    endDateTimeUtc: string
    // A 0 ou 1 number is required for WebGL to understand boolean
    isAirMission: number
    isClosed: number
    // A 0 ou 1 number is required for WebGL to understand boolean
    isDone: number
    // A 0 ou 1 number is required for WebGL to understand boolean
    isInProgress: number
    // A 0 ou 1 number is required for WebGL to understand boolean
    isLandMission: number
    // A 0 ou 1 number is required for WebGL to understand boolean
    isSeaMission: number
    // A 0 ou 1 number is required for WebGL to understand boolean
    isUpcoming: number
    missionId: number
    missionSource: MissionSource
    missionStatus: MissionStatus | undefined
    missionTypes: MissionType[]
    numberOfControls: number
    numberOfSurveillance: number
    startDateTimeUtc: string
  }

  export type MissionActionFeatureProperties = {
    actionType: MissionAction.MissionActionType
    dateTime: string
    flagState: string | undefined
    hasGearSeized: boolean
    hasSpeciesSeized: boolean
    infractionsNatinfs: string[]
    missionId: number
    numberOfInfractions: number
    numberOfInfractionsWithRecords: number
    vesselName: string | undefined
  }
}

export interface MissionWithActions extends Mission.Mission {
  actions: MissionAction.MissionAction[]
}
