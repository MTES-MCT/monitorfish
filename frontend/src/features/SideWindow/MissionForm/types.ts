import type { MissionType } from '../../../domain/types/mission'

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
  startDate: Date
  type: MissionType.SEA
}
export type PartialSeaControl = Partial<SeaControl> & {
  startDate: Date
  type: MissionType.SEA
}

type FreeNote = {
  startDate: Date
  type: undefined
}
export type PartialFreeNote = Partial<FreeNote> & {
  startDate: Date
  type: undefined
}
