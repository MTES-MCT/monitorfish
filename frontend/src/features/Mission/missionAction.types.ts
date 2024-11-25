import type { LegacyControlUnit } from '../ControlUnit/legacyControlUnit'

export namespace MissionAction {
  export interface MissionAction {
    actionDatetimeUtc: string
    actionType: MissionActionType
    completedBy: string | undefined
    completion: CompletionStatus
    controlQualityComments: string | undefined
    controlUnits: LegacyControlUnit.LegacyControlUnit[]
    districtCode: string | undefined
    emitsAis: ControlCheck | undefined
    emitsVms: ControlCheck | undefined
    externalReferenceNumber: string | undefined
    facade: string | undefined
    faoAreas: string[]
    feedbackSheetRequired: boolean | undefined
    flagState: string | undefined
    gearInfractions: Infraction[]
    gearOnboard: GearControl[]
    hasSomeGearsSeized: boolean
    hasSomeSpeciesSeized: boolean
    id: number
    internalReferenceNumber: string | undefined
    ircs: string | undefined
    isAdministrativeControl: boolean | undefined
    isComplianceWithWaterRegulationsControl: boolean | undefined
    isFromPoseidon: boolean | undefined
    isSafetyEquipmentAndStandardsComplianceControl: boolean | undefined
    isSeafarersControl: boolean | undefined
    latitude: number | undefined
    licencesAndLogbookObservations: string | undefined
    licencesMatchActivity: ControlCheck | undefined
    logbookInfractions: Infraction[]
    logbookMatchesActivity: ControlCheck | undefined
    longitude: number | undefined
    missionId: number
    numberOfVesselsFlownOver: number | undefined
    otherComments: string | undefined
    otherInfractions: Infraction[]
    portLocode: string | undefined
    // This field is added by the API
    portName: string | undefined
    segments: FleetSegment[]
    seizureAndDiversion: boolean | undefined
    seizureAndDiversionComments: string | undefined
    separateStowageOfPreservedSpecies: ControlCheck | undefined
    speciesInfractions: Infraction[]
    speciesObservations: string | undefined
    speciesOnboard: SpeciesControl[]
    speciesQuantitySeized: number | undefined
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
    hasUncontrolledMesh: boolean
  }

  export type Infraction = {
    comments: string
    infractionType: InfractionType
    natinf: number
  }

  export type LastControls = {
    LAND: ControlAndText
    SEA: ControlAndText
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

  export type SpeciesControl = {
    controlledWeight: number | undefined
    declaredWeight: number | undefined
    nbFish: number | undefined
    speciesCode: string
    underSized: boolean | undefined
  }

  export enum CompletionStatus {
    COMPLETED = 'COMPLETED',
    TO_COMPLETE = 'TO_COMPLETE'
  }

  export enum FrontCompletionStatus {
    COMPLETED = 'COMPLETED',
    TO_COMPLETE = 'TO_COMPLETE',
    TO_COMPLETE_MISSION_ENDED = 'TO_COMPLETE_MISSION_ENDED',
    UP_TO_DATE = 'UP_TO_DATE'
  }

  export enum FrontCompletionStatusLabel {
    COMPLETED = 'Complétées',
    TO_COMPLETE = 'À compléter',
    UP_TO_DATE = 'À jour'
  }
}
