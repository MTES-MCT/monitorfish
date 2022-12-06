import type { MissionType } from '../../../domain/types/mission'

export type Action = AirControl | SeaControl
export type PartialAction = PartialAirControl | PartialSeaControl

type AirControl = {
  endDate: Date
  startDate: Date
  type: MissionType.AIR
}
export type PartialAirControl = Partial<AirControl> & {
  type: MissionType.AIR
}

type SeaControl = {
  date: Date
  type: MissionType.SEA
}
export type PartialSeaControl = Partial<SeaControl> & {
  type: MissionType.SEA
}
