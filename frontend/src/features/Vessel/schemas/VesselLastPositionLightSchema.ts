import { VesselLastPositionSchema } from '@features/Vessel/schemas/VesselLastPositionSchema'

export const VesselLastPositionLightSchema = VesselLastPositionSchema.omit({
  alerts: true,
  detectabilityRiskFactor: true,
  impactRiskFactor: true,
  postControlComment: true,
  probabilityRiskFactor: true,
  reportings: true,
  riskFactor: true
})
