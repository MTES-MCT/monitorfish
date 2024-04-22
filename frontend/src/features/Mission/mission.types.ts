import { SeaFront } from '@constants/seaFront'
import { EnvMissionAction } from '@features/Mission/envMissionAction.types'

import type { GeoJSON } from '../../domain/types/GeoJSON'
import type { LegacyControlUnit } from '../../domain/types/legacyControlUnit'
import type { MissionAction } from '@features/Mission/missionAction.types'
import type { Except } from 'type-fest'

export namespace Mission {
  export interface Mission {
    closedBy?: string
    controlUnits: LegacyControlUnit.LegacyControlUnit[]
    createdAtUtc?: string | undefined
    endDateTimeUtc?: string
    envActions: EnvMissionAction.MissionAction[]
    facade?: SeaFront
    geom?: GeoJSON.MultiPolygon
    hasMissionOrder?: boolean | undefined
    id: number
    // TODO To remove when `isClosed` is removed
    isClosed?: boolean | undefined
    isGeometryComputedFromControls: boolean
    isUnderJdp?: boolean | undefined
    missionSource: MissionSource
    missionTypes: MissionType[]
    observationsCacem?: string
    observationsCnsp?: string
    openBy?: string
    startDateTimeUtc: string
    updatedAtUtc?: string | undefined
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

  /* eslint-disable typescript-sort-keys/string-enum */
  export enum MissionStatus {
    UPCOMING = 'UPCOMING',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
  }
  export enum MissionStatusLabel {
    UPCOMING = 'À venir',
    IN_PROGRESS = 'En cours',
    DONE = 'Terminée'
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

  export type MissionData = Except<Mission, 'id' | 'envActions'>

  export type SavedMission = Except<Mission, 'envActions'>

  export type MissionPointFeatureProperties = {
    color: string
    controlUnits: LegacyControlUnit.LegacyControlUnit[]
    endDateTimeUtc: string
    hasEnvActions: boolean
    hasFishActions: boolean
    // A 0 ou 1 number is required for WebGL to understand boolean
    isAirMission: number
    // A 0 ou 1 number is required for WebGL to understand boolean
    isDone: number
    // A 0 ou 1 number is required for WebGL to understand boolean
    isInProgress: number
    // A 0 ou 1 number is required for WebGL to understand boolean
    isLandMission: number
    // A 0 ou 1 number is required for WebGL to understand boolean
    isMultiMission: number
    // A 0 ou 1 number is required for WebGL to understand boolean
    isSeaMission: number
    // A 0 ou 1 number is required for WebGL to understand boolean
    isUpcoming: number
    missionCompletion: MissionAction.FrontCompletionStatus | undefined
    missionId: number
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

  export interface MissionWithActions extends Mission {
    actions: MissionAction.MissionAction[]
  }
}
