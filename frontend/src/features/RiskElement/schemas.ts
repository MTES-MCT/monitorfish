import { ReportingAndOccurrencesSchema } from '@features/Reporting/schemas/VesselReportingsSchema'
import { z } from 'zod'

import { RiskElement } from './types'

export const NonCompliantTripSchema = z.strictObject({
  endDateTimeUtc: z.string().nullable(),
  startDateTimeUtc: z.string().nullable(),
  tripNumber: z.string()
})

const TripsMetricsSchema = z.strictObject({
  compliantTrips: z.number(),
  /** Sorted from the most recent trip to the oldest one */
  nonCompliantTrips: z.array(NonCompliantTripSchema),
  shareOfNonCompliantTrips: z.number(),
  totalTrips: z.number(),
  type: z.literal(RiskElement.MetricsType.TRIPS)
})

const OccurrencesMetricsSchema = z.strictObject({
  occurrences: z.number(),
  type: z.literal(RiskElement.MetricsType.OCCURRENCES)
})

export const VesselRiskElementSchema = z.strictObject({
  code: z.string(),
  metrics: z.discriminatedUnion('type', [TripsMetricsSchema, OccurrencesMetricsSchema]),
  name: z.string(),
  reportings: ReportingAndOccurrencesSchema.nullable(),
  riskLevel: z.number()
})
