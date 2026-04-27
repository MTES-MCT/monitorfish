import { ReportingType } from '@features/Reporting/types/ReportingType'
import { stringOrUndefined } from 'types'
import z from 'zod'

export const DisplayedReportingSchema = z.strictObject({
  coordinates: z.array(z.number()),
  description: z.string(),
  expirationDate: stringOrUndefined,
  featureId: z.string(),
  flagState: z.string(),
  from: z.string(),
  id: z.number(),
  infractions: z.array(
    z.object({
      natinfCode: z.number(),
      threat: z.string(),
      threatCharacterization: z.string()
    })
  ),
  isArchived: z.boolean(),
  isInfractionSuspicion: z.boolean(),
  isIUU: z.boolean(),
  isObservation: z.boolean(),
  reportingDate: z.string(),
  title: z.string(),
  type: z.enum(ReportingType),
  validationDate: stringOrUndefined,
  vesselName: stringOrUndefined
})
