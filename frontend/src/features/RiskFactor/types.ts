import { Vessel } from '@features/Vessel/Vessel.types'
import { z } from 'zod'

import { numberOrUndefined, stringOrUndefined } from '../../types'

// TODO Check which of these types are nullable or not
export const RiskFactorSchema = z.strictObject({
  controlPriorityLevel: z.number(),
  controlRateRiskFactor: z.number(),
  detectabilityRiskFactor: z.number(),
  gearOnboard: z.array(Vessel.DeclaredLogbookGearSchema).optional(),
  impactRiskFactor: z.number(),
  lastControlDatetime: stringOrUndefined,
  numberControlsLastFiveYears: numberOrUndefined,
  numberControlsLastThreeYears: numberOrUndefined,
  numberGearSeizuresLastFiveYears: numberOrUndefined,
  numberInfractionsLastFiveYears: numberOrUndefined,
  numberSpeciesSeizuresLastFiveYears: numberOrUndefined,
  numberVesselSeizuresLastFiveYears: numberOrUndefined,
  probabilityRiskFactor: z.number(),
  riskFactor: z.number(),
  segmentHighestImpact: stringOrUndefined,
  segmentHighestPriority: stringOrUndefined,
  segments: z.array(z.string()),
  speciesOnboard: z.array(Vessel.DeclaredLogbookSpeciesSchema).optional()
})

export type RiskFactor = z.infer<typeof RiskFactorSchema>
