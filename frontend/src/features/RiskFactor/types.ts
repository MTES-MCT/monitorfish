import { DeclaredLogbookSpeciesSchema } from '@features/Vessel/schemas/ActiveVesselSchema'
import { z } from 'zod'

import { numberOrUndefined, stringOrUndefined } from '../../types'

export const DeclaredLogbookGearSchema = z.strictObject({
  dimensions: stringOrUndefined,
  gear: stringOrUndefined,
  mesh: numberOrUndefined
})

export const RiskFactorSchema = z.strictObject({
  controlPriorityLevel: z.number(),
  controlRateRiskFactor: z.number(),
  detectabilityRiskFactor: z.number(),
  gearOnboard: z.array(DeclaredLogbookGearSchema),
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
  speciesOnboard: z.array(DeclaredLogbookSpeciesSchema)
})

export type RiskFactor = z.infer<typeof RiskFactorSchema>
