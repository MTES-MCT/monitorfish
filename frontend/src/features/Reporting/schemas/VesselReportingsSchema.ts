import { ReportingSchema } from '@features/Reporting/schemas/ReportingSchema'
import { z } from 'zod'

export const ThreatSummarySchema = z.strictObject({
  natinf: z.string(),
  natinfCode: z.number(),
  numberOfOccurrences: z.number(),
  threatCharacterization: z.string()
})

export const ReportingAndOccurrencesSchema = z.strictObject({
  otherOccurrencesOfSameAlert: z.array(ReportingSchema),
  reporting: ReportingSchema
})

export const VesselReportingsSchema = z.strictObject({
  archived: z.record(z.string(), z.array(ReportingAndOccurrencesSchema)),
  current: z.array(ReportingAndOccurrencesSchema),
  summary: z.record(z.string(), z.array(ThreatSummarySchema))
})
