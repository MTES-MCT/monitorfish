import type { Gear, Species } from '../types'

export type RiskFactor = {
  controlPriorityLevel: number
  controlRateRiskFactor: number
  detectabilityRiskFactor: number
  gearOnboard: Gear[]
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
  speciesOnboard: Species[]
}
