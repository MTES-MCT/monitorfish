import type { ControlUnit } from './controlUnit'

export namespace MissionAction {
  export interface MissionAction {
    actionDatetimeUtc: string
    actionType: MissionActionType
    controlQualityComments: string | undefined
    controlUnits: ControlUnit.ControlUnit[]
    districtCode: string | undefined
    diversion: boolean | undefined
    emitsAis: ControlCheck | undefined
    emitsVms: ControlCheck | undefined
    externalReferenceNumber: string | undefined
    facade: string | undefined
    faoAreas: string[]
    feedbackSheetRequired: boolean | undefined
    flagState: string | undefined
    gearInfractions: GearInfraction[]
    gearOnboard: GearControl[]
    hasSomeGearsSeized: number
    hasSomeSpeciesSeized: number
    id: number
    internalReferenceNumber: string | undefined
    ircs: string | undefined
    isFromPoseidon: boolean | undefined
    isValid: boolean
    latitude: number | undefined
    licencesAndLogbookObservations: string | undefined
    licencesMatchActivity: ControlCheck | undefined
    logbookInfractions: LogbookInfraction[]
    logbookMatchesActivity: ControlCheck | undefined
    longitude: number | undefined
    missionId: number
    numberOfVesselsFlownOver: number | undefined
    otherComments: string | undefined
    otherInfractions: OtherInfraction[]
    portLocode: string | undefined
    // This field is added by the API
    portName: string | undefined
    segments: FleetSegment[]
    seizureAndDiversion: boolean | undefined
    seizureAndDiversionComments: string | undefined
    separateStowageOfPreservedSpecies: ControlCheck | undefined
    speciesInfractions: SpeciesInfraction[]
    speciesObservations: string | undefined
    speciesOnboard: SpeciesControl[]
    speciesSizeControlled: boolean | undefined
    speciesWeightControlled: boolean | undefined
    unitWithoutOmegaGauge: boolean | undefined
    userTrigram: string | undefined
    vesselId: number | undefined
    vesselName: string | undefined
    vesselTargeted: ControlCheck | undefined
  }

  // ---------------------------------------------------------------------------
  // Constants

  /* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
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

  export enum InfractionDomain {
    GEAR = 'GEAR',
    LOGBOOK = 'LOGBOOK',
    OTHER = 'OTHER',
    SPECIES = 'SPECIES'
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
  /* eslint-enable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */

  // ---------------------------------------------------------------------------
  // Types

  export type ControlAndText = {
    control: MissionAction | undefined
    text: string
  }

  export type FleetSegment = {
    segment: string | undefined
    segmentName: string | undefined
  }

  export type GearControl = {
    comments: string | undefined
    controlledMesh: number | undefined
    declaredMesh: number | undefined
    gearCode: string
    gearName: string
    gearWasControlled: boolean | undefined
  }

  export type GearInfraction = {
    comments: string
    infractionType: InfractionType
    natinf: number
  }

  export type Infraction = {
    infraction: string
    infractionCategory: string
    natinfCode: number
    regulation: string
  }

  export type LastControls = {
    LAND: ControlAndText
    SEA: ControlAndText
  }

  export type LogbookInfraction = {
    comments: string
    infractionType: InfractionType
    // TODO This should be a plural.
    natinf: number
  }

  export type MissionActionData = Omit<MissionAction, 'id' | 'portName'> & {
    id: MissionAction['id'] | undefined
  }

  export type MissionControlsSummary = {
    controls: MissionAction[]
    numberOfControlsWithSomeGearsSeized: number
    numberOfControlsWithSomeSpeciesSeized: number
    numberOfDiversions: number
    vesselId: number
  }

  export type OtherInfraction = {
    comments: string
    infractionType: InfractionType
    natinf: number
  }

  export type SpeciesControl = {
    controlledWeight: number | undefined
    declaredWeight: number | undefined
    nbFish: number | undefined
    speciesCode: string
    underSized: boolean | undefined
  }

  export type SpeciesInfraction = {
    comments: string
    infractionType: InfractionType
    natinf: number
  }
}
