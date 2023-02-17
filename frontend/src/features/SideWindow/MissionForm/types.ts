import type { ControlUnit } from '../../../domain/types/controlUnit'
import type { MissionType, MissionData } from '../../../domain/types/mission'
import type { DeepPartial, Undefine } from '../../../types'
import type { DateAsStringRange } from '@mtes-mct/monitor-ui'

export type Action = AirControl | GroundControl | SeaControl | FreeNote
export type PartialAction = PartialAirControl | PartialGroundControl | PartialSeaControl | PartialFreeNote

export type MissionFormValues = Partial<
  Omit<
    MissionData,
    'controlUnits' | 'endDateTimeUtc' | 'startDateTimeUtc' | 'missionSource' | 'missionType' | 'controlUnits'
  >
> & {
  controlUnits: Undefine<ControlUnit>[]
  dateTimeRangeUtc: DateAsStringRange | undefined
  hasOrder?: boolean | undefined
  isUnderJdp?: boolean | undefined
  missionType: MissionType
}

type AirControl = {
  endDate: Date
  startDate: Date
  type: MissionType.AIR
}
export type PartialAirControl = Partial<AirControl> & {
  startDate: Date
  type: MissionType.AIR
}

type GroundControl = {
  startDate: Date
  type: MissionType.LAND
}
export type PartialGroundControl = Partial<GroundControl> & {
  startDate: Date
  type: MissionType.LAND
}

type SeaControl = {
  compliance: {
    ais: string
    customInfractions: Array<{
      natinfs: number[]
      note: string
      type: string
    }>
    jdp: string
    permissions: string
    vms: string
  }
  deviceInfractions: Array<{
    declaredNetting: number
    deviceName: string
    isNettingUnmeasured: boolean
    isOmegaGaugeMissing: boolean
    measuredNetting: number
    otmNote: string
    pingersState: string
  }>
  hasNoOnboardSpecy: boolean
  isOmegaGaugeMissing: boolean
  specyInfractions: Array<{
    specyName: string
  }>
  startDate: Date
  tideFishingZones: string[]
  tideFleetSegments: string[]
  type: MissionType.SEA
  vessel: {
    externalReferenceNumber?: string | null
    flagState: string | null
    internalReferenceNumber?: string | null
    ircs?: string | null
    mmsi?: string | null
    vesselId: number
    vesselName: string
  }
}

export type PartialSeaControl = Omit<
  DeepPartial<SeaControl>,
  'compliance' | 'deviceInfractions' | 'specyInfractions' | 'tideFishingZones' | 'tideFleetSegments' | 'vessel'
> & {
  compliance: Partial<SeaControl['compliance']> & {
    customInfractions: Array<Partial<SeaControl['compliance']['customInfractions'][0]>>
  }
  deviceInfractions: Array<Partial<SeaControl['deviceInfractions'][0]>>
  specyInfractions: Array<
    Partial<
      Omit<SeaControl['specyInfractions'][0], 'specyName'> & {
        specyName: string
      }
    >
  >
  startDate: Date
  tideFishingZones: string[]
  tideFleetSegments: string[]
  type: MissionType.SEA
  vessel: Undefine<SeaControl['vessel']>
}

type FreeNote = {
  note: string
  startDate: Date
  type: undefined
}
export type PartialFreeNote = Partial<FreeNote> & {
  startDate: Date
  type: undefined
}
