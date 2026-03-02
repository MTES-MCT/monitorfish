import { ReportingType } from '@features/Reporting/types/ReportingType'
import { stringOrUndefined } from 'types'
import z from 'zod'

export const DisplayedReportingSchema = z.strictObject({
  coordinates: z.array(z.number()),
  creationDate: z.string(),
  expirationDate: stringOrUndefined,
  featureId: z.string(),
  flagState: z.string(),
  id: z.number(),
  isArchived: z.boolean(),
  isInfractionSuspicion: z.boolean(),
  isIUU: z.boolean(),
  isObservation: z.boolean(),
  threat: stringOrUndefined,
  threatCharacterization: stringOrUndefined,
  title: z.string(),
  type: z.enum(ReportingType),
  validationDate: stringOrUndefined,
  vesselName: stringOrUndefined
})
