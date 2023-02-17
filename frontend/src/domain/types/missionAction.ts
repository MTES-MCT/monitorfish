export type Infraction = {
  infraction: string
  infractionCategory: string
  natinfCode: number
  regulation: string
}

export enum MissionActionType {
  AIR_CONTROL = 'AIR_CONTROL',
  AIR_SURVEILLANCE = 'AIR_SURVEILLANCE',
  LAND_CONTROL = 'LAND_CONTROL',
  OBSERVATION = 'OBSERVATION',
  SEA_CONTROL = 'SEA_CONTROL'
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

export enum InfractionType {
  PENDING = 'PENDING',
  WITHOUT_RECORD = 'WITHOUT_RECORD',
  WITH_RECORD = 'WITH_RECORD'
}

export enum InfractionDomain {
  GEAR = 'GEAR',
  LOGBOOK = 'LOGBOOK',
  OTHER = 'OTHER',
  SPECIES = 'SPECIES'
}

export const isGearInfraction = (p: any): p is GearInfraction => p.gearSeized !== undefined
export const isSpeciesInfraction = (p: any): p is SpeciesInfraction => p.speciesSeized !== undefined

export type GearInfraction = {
  comments: string
  gearSeized: boolean
  infractionType: InfractionType
  natinf: number
}

export type SpeciesInfraction = {
  comments: string
  infractionType: InfractionType
  natinf: number
  speciesSeized: boolean
}

export type LogbookInfraction = {
  comments: string
  infractionType: InfractionType
  natinf: number
}

export type OtherInfraction = {
  comments: string
  infractionType: InfractionType
  natinf: number
}

export type GearControl = {
  comments: string | null
  controlledMesh: number | null
  declaredMesh: number | null
  gearCode: string
  gearName: string
  gearWasControlled: boolean | null
}

export type SpeciesControl = {
  controlledWeight: number | null
  declaredWeight: number | null
  nbFish: number | null
  speciesCode: string
  underSized: boolean | null
}

export type FleetSegment = {
  segment: string | null
  segmentName: string | null
}

export type MissionAction = {
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

export type ControlUnit = {
  administration: string
  contact: string
  id: number
  name: string
  resources: ControlResource[]
}

export type ControlResource = {
  id: number
  name: string
}

export type MissionControlsSummary = {
  controls: MissionAction[]
  numberOfDiversions: number
  numberOfGearSeized: number
  numberOfSpeciesSeized: number
  vesselId: number
}

export type LastControls = {
  LAND: ControlAndText
  SEA: ControlAndText
}

export type ControlAndText = {
  control: MissionAction | undefined
  text: string
}

export const INITIAL_LAST_CONTROLS: LastControls = {
  LAND: {
    control: undefined,
    text: 'Dernier contrôle à quai'
  },
  SEA: {
    control: undefined,
    text: 'Dernier contrôle en mer'
  }
}
