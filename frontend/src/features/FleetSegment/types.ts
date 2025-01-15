import type { Undefine } from '@mtes-mct/monitor-ui'
import type { Float } from 'type-fest'

export enum ScipSpeciesType {
  DEMERSAL = 'DEMERSAL',
  OTHER = 'OTHER',
  PELAGIC = 'PELAGIC',
  TUNA = 'TUNA'
}

export type FleetSegment = {
  faoAreas: string[] | undefined
  gears: string[] | undefined
  impactRiskFactor: Float<number> | undefined
  mainScipSpeciesType: ScipSpeciesType | undefined
  maxMesh: number | undefined
  minMesh: number | undefined
  minShareOfTargetSpecies: number | undefined
  priority: number
  segment: string
  segmentName: string | undefined
  targetSpecies: string[] | undefined
  vesselTypes: string[]
  year: number
}

export type UpdateFleetSegment = Undefine<FleetSegment>
