import type { Float } from 'type-fest'

export type FleetSegment = {
  bycatchSpecies: string[] | null
  faoAreas: string[] | null
  gears: string[] | null
  impactRiskFactor: Float<number> | null
  segment: string
  segmentName: string | null
  targetSpecies: string[] | null
  year: number
}

export type UpdateFleetSegment = {
  bycatchSpecies: string[] | null
  faoAreas: string[] | null
  gears: string[] | null
  impactRiskFactor: Float<number> | null
  segment: string | null
  segmentName: string | null
  targetSpecies: string[] | null
  year: number | null
}
