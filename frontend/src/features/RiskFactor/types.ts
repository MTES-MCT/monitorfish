import { Vessel } from '@features/Vessel/Vessel.types'
import { z } from 'zod'

import { stringOrUndefined } from '../../types'

export const RiskFactorSchema = z.strictObject({
  controlPriorityLevel: z.number(),
  controlRateRiskFactor: z.number(),
  detectabilityRiskFactor: z.number(),
  gearOnboard: z.array(Vessel.DeclaredLogbookGearSchema),
  impactRiskFactor: z.number(),
  lastControlDatetime: stringOrUndefined,
  numberControlsLastFiveYears: z.number(),
  numberControlsLastThreeYears: z.number(),
  numberGearSeizuresLastFiveYears: z.number(),
  numberInfractionsLastFiveYears: z.number(),
  numberSpeciesSeizuresLastFiveYears: z.number(),
  numberVesselSeizuresLastFiveYears: z.number(),
  probabilityRiskFactor: z.number(),
  riskFactor: z.number(),
  segmentHighestImpact: stringOrUndefined,
  segmentHighestPriority: stringOrUndefined,
  segments: z.array(z.string()),
  speciesOnboard: z.array(Vessel.DeclaredLogbookSpeciesSchema)
})

export type RiskFactor = z.infer<typeof RiskFactorSchema>
