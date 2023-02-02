import type { ControlUnit } from './controlUnit'

export namespace MissionAction {
  export interface MissionAction {
    actionDatetimeUtc: string
    actionType: MissionActionType
    controlQualityComments: String | null
    controlUnits: ControlUnit[]
    diversion: Boolean | null
    emitsAis: ControlCheck | null
    emitsVms: ControlCheck | null
    facade: String | null
    feedbackSheetRequired: Boolean | null
    gearInfractions: GearInfraction[]
    gearOnboard: GearControl[]
    id: number | null
    isFromPoseidon: boolean | null
    latitude: number | null
    licencesAndLogbookObservations: String | null
    licencesMatchActivity: ControlCheck | null
    logbookInfractions: LogbookInfraction[]
    logbookMatchesActivity: ControlCheck | null
    longitude: number | null
    missionId: number
    numberOfVesselsFlownOver: number | null
    otherComments: String | null
    otherInfractions: OtherInfraction[]
    portLocode: String | null
    portName: String | null
    segments: FleetSegment[]
    seizureAndDiversion: Boolean | null
    seizureAndDiversionComments: String | null
    separateStowageOfPreservedSpecies: Boolean | null
    speciesInfractions: SpeciesInfraction[]
    speciesObservations: String | null
    speciesOnboard: SpeciesControl[]
    speciesSizeControlled: Boolean | null
    speciesWeightControlled: Boolean | null
    unitWithoutOmegaGauge: Boolean | null
    userTrigram: String | null
    vesselId: number
    vesselTargeted: Boolean | null
  }

  export type ControlAndText = {
    control: MissionAction | undefined
    text: string
  }

  enum ControlCheck {
    NO = 'NO',
    NOT_APPLICABLE = 'NOT_APPLICABLE',
    YES = 'YES'
  }

  export type Controller = {
    administration: string
    controller: string
    controllerType: string
  }

  export type FleetSegment = {
    segment: string | null
    segmentName: string | null
  }

  export type GearControl = {
    comments: string | null
    controlledMesh: number | null
    declaredMesh: number | null
    gearCode: string
    gearName: string
    gearWasControlled: boolean | null
  }

  export type GearInfraction = {
    comments: string
    gearSeized: boolean
    infractionType: InfractionType
    natinf: number
  }

  export type Infraction = {
    infraction: string
    infractionCategory: string
    natinfCode: number
    regulation: string
  }

  export enum InfractionDomain {
    GEAR = 'GEAR',
    LOGBOOK = 'LOGBOOK',
    OTHER = 'OTHER',
    SPECIES = 'SPECIES'
  }

  export enum InfractionType {
    PENDING = 'PENDING',
    WITHOUT_RECORD = 'WITHOUT_RECORD',
    WITH_RECORD = 'WITH_RECORD'
  }

  export type LastControls = {
    LAND: ControlAndText
    SEA: ControlAndText
  }

  export type LogbookInfraction = {
    comments: string
    infractionType: InfractionType
    natinf: number
  }

  export enum MissionActionType {
    AIR_CONTROL = 'AIR_CONTROL',
    AIR_SURVEILLANCE = 'AIR_SURVEILLANCE',
    LAND_CONTROL = 'LAND_CONTROL',
    OBSERVATION = 'OBSERVATION',
    SEA_CONTROL = 'SEA_CONTROL'
  }

  export type MissionControlsSummary = {
    controls: MissionAction[]
    numberOfDiversions: number
    numberOfGearSeized: number
    numberOfSpeciesSeized: number
    vesselId: number
  }

  export type OtherInfraction = {
    comments: string
    infractionType: InfractionType
    natinf: number
  }

  export type SpeciesControl = {
    controlledWeight: number | null
    declaredWeight: number | null
    nbFish: number | null
    speciesCode: string
    underSized: boolean | null
  }

  export type SpeciesInfraction = {
    comments: string
    infractionType: InfractionType
    natinf: number
    speciesSeized: boolean
  }
}
