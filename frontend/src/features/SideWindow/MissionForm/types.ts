import type { MissionType } from '../../../domain/types/mission'
import type { DeepPartial } from '@mtes-mct/monitor-ui/types'

export type Action = AirControl | GroundControl | SeaControl | FreeNote
export type PartialAction = PartialAirControl | PartialGroundControl | PartialSeaControl | PartialFreeNote

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
  type: MissionType.GROUND
}
export type PartialGroundControl = Partial<GroundControl> & {
  startDate: Date
  type: MissionType.GROUND
}

type SeaControl = {
  compliance: {
    ais: string
    customInfractions: Array<{
      natinfs: string[]
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
}
export type PartialSeaControl = Omit<
  DeepPartial<SeaControl>,
  'compliance' | 'deviceInfractions' | 'specyInfractions' | 'tideFishingZones' | 'tideFleetSegments'
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
