import type { ControlUnit } from './controlUnit'
import type { Except } from 'type-fest'

export namespace MissionAction {
  export interface MissionAction {
    actionDatetimeUtc: string
    actionType: MissionActionType
    controlQualityComments: String | undefined
    controlUnits: ControlUnit[]
    diversion: Boolean | undefined
    emitsAis: ControlCheck | undefined
    emitsVms: ControlCheck | undefined
    facade: String | undefined
    feedbackSheetRequired: Boolean | undefined
    gearInfractions: GearInfraction[]
    gearOnboard: GearControl[]
    id: number | undefined
    isFromPoseidon: boolean | undefined
    latitude: number | undefined
    licencesAndLogbookObservations: String | undefined
    licencesMatchActivity: ControlCheck | undefined
    logbookInfractions: LogbookInfraction[]
    logbookMatchesActivity: ControlCheck | undefined
    longitude: number | undefined
    missionId: number
    numberOfVesselsFlownOver: number | undefined
    otherComments: String | undefined
    otherInfractions: OtherInfraction[]
    portLocode: String | undefined
    portName: String | undefined
    segments: FleetSegment[]
    seizureAndDiversion: Boolean | undefined
    seizureAndDiversionComments: String | undefined
    separateStowageOfPreservedSpecies: Boolean | undefined
    speciesInfractions: SpeciesInfraction[]
    speciesObservations: String | undefined
    speciesOnboard: SpeciesControl[]
    speciesSizeControlled: Boolean | undefined
    speciesWeightControlled: Boolean | undefined
    unitWithoutOmegaGauge: Boolean | undefined
    userTrigram: String | undefined
    vesselId: number
    vesselTargeted: Boolean | undefined

    // TODO I had to add that.
    // eslint-disable-next-line typescript-sort-keys/interface
    vesselName: string
  }

  export type ControlAndText = {
    control: MissionAction | undefined
    text: string
  }

  export enum ControlCheck {
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

    // TODO I had to add that.
    // eslint-disable-next-line typescript-sort-keys/interface
    faoAreas: string[]
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

  /* eslint-disable typescript-sort-keys/string-enum */
  export enum InfractionType {
    WITH_RECORD = 'WITH_RECORD',
    WITHOUT_RECORD = 'WITHOUT_RECORD',
    PENDING = 'PENDING'
  }
  export const InfractionTypeLabel: Record<InfractionType, string> = {
    [InfractionType.WITH_RECORD]: 'Avec PV',
    [InfractionType.WITHOUT_RECORD]: 'Sans PV',
    [InfractionType.PENDING]: 'En attente'
  }
  /* eslint-enable typescript-sort-keys/string-enum */

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

  export type MissionActionData = Except<MissionAction, 'id'>

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
    // TODO This should be a plural.
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
