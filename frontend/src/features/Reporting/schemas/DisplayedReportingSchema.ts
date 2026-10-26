import { ReportingTargetType } from '@features/Reporting/types/ReportingTargetType'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { numberOrUndefined, stringOrUndefined } from 'types'
import z from 'zod'

export const DisplayedReportingSchema = z.strictObject({
  coordinates: z.array(z.number()),
  description: z.string(),
  expirationDate: stringOrUndefined,
  featureId: z.string(),
  flagState: z.string(),
  from: z.string(),
  gearCode: stringOrUndefined,
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
  numberOfTargets: numberOrUndefined,
  reportingDate: z.string(),
  targetType: z.enum(ReportingTargetType),
  title: z.string(),
  type: z.enum(ReportingType),
  validationDate: stringOrUndefined,
  vesselName: stringOrUndefined
})
