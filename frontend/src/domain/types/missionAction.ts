// TODO Maybe avoid using `Boolean` instead of `boolean`?
// Because of https://stackoverflow.com/a/64443353/2736233

import type { ControlUnit } from './controlUnit'

export namespace MissionAction {
  export interface MissionAction {
    actionDatetimeUtc: string | undefined
    actionType: MissionActionType
    controlQualityComments: string | undefined
    controlUnits: ControlUnit[]
    diversion: Boolean | undefined
    emitsAis: ControlCheck | undefined
    emitsVms: ControlCheck | undefined
    externalReferenceNumber: string | undefined
    facade: string | undefined
    feedbackSheetRequired: Boolean | undefined
    flagState: string | undefined
    gearInfractions: GearInfraction[]
    gearOnboard: GearControl[]
    id: number
    internalReferenceNumber: string | undefined
    ircs: string | undefined
    isFromPoseidon: boolean | undefined
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
    portName: string | undefined
    segments: FleetSegment[]
    seizureAndDiversion: Boolean | undefined
    seizureAndDiversionComments: string | undefined
    separateStowageOfPreservedSpecies: Boolean | undefined
    speciesInfractions: SpeciesInfraction[]
    speciesObservations: string | undefined
    speciesOnboard: SpeciesControl[]
    speciesSizeControlled: Boolean | undefined
    speciesWeightControlled: Boolean | undefined
    unitWithoutOmegaGauge: Boolean | undefined
    userTrigram: string | undefined
    vesselId: number | undefined
    vesselName: string | undefined
    vesselTargeted: Boolean | undefined
  }

  // ---------------------------------------------------------------------------
  // Constants

  /* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
  export enum ControlCheck {
    NO = 'NO',
    NOT_APPLICABLE = 'NOT_APPLICABLE',
    YES = 'YES'
  }

  // TODO Remove that once it's included in the API data.
  export const PORT = {
    'LE HAVRE': 'HAVRE',
    MARSEILLE: 'MARSEILLE'
  }

  // TODO Update that once it's included in the API data.
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
  // Helpers

  export const isGearInfraction = (p: any): p is GearInfraction => p.gearSeized !== undefined
  export const isSpeciesInfraction = (p: any): p is SpeciesInfraction => p.speciesSeized !== undefined

  // ---------------------------------------------------------------------------
  // Types

  export type ControlAndText = {
    control: MissionAction | undefined
    text: string
  }

  export type FleetSegment = {
    segment: string | undefined
    segmentName: string | undefined

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

  export type MissionActionData = Omit<MissionAction, 'id'> & {
    id: MissionAction['id'] | undefined
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
    speciesSeized: boolean
  }
}
