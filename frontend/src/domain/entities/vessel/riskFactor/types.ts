import type { DeclaredLogbookGear, DeclaredLogbookSpecies } from '../types'

export type RiskFactor = {
  controlPriorityLevel: number
  controlRateRiskFactor: number
  detectabilityRiskFactor: number
  gearOnboard: DeclaredLogbookGear[] | undefined
  impactRiskFactor: number
  lastControlDatetime: string
  numberControlsLastFiveYears: number
  numberControlsLastThreeYears: number
  numberGearSeizuresLastFiveYears: number
  numberInfractionsLastFiveYears: number
  numberSpeciesSeizuresLastFiveYears: number
  numberVesselSeizuresLastFiveYears: number
  probabilityRiskFactor: number
  riskFactor: number
  segmentHighestImpact: string
  segmentHighestPriority: string
  segments: string[]
  speciesOnboard: DeclaredLogbookSpecies[] | undefined
}
