import type { Float } from 'type-fest'

export type FleetSegment = {
  bycatchSpecies: string[] | undefined
  faoAreas: string[] | undefined
  gears: string[] | undefined
  impactRiskFactor: Float<number> | undefined
  segment: string
  segmentName: string | undefined
  targetSpecies: string[] | undefined
  year: number
}

export type UpdateFleetSegment = {
  bycatchSpecies: string[] | undefined
  faoAreas: string[] | undefined
  gears: string[] | undefined
  impactRiskFactor: Float<number> | undefined
  segment: string | undefined
  segmentName: string | undefined
  targetSpecies: string[] | undefined
  year: number | undefined
}
