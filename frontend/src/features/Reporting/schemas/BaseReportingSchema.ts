import { InfractionSchema } from '@features/Infraction/schemas/InfractionSchema'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from 'types'
import z from 'zod'

export const BaseReportingSchema = z.strictObject({
  createdBy: z.string(),
  creationDate: z.string(),
  expirationDate: stringOrUndefined,
  externalReferenceNumber: stringOrUndefined,
  flagState: z.string(),
  id: z.number(),
  infraction: z.union([InfractionSchema, z.undefined()]),
  internalReferenceNumber: stringOrUndefined,
  ircs: stringOrUndefined,
  isArchived: z.boolean(),
  isDeleted: z.boolean(),
  type: z.enum(ReportingType),
  underCharter: booleanOrUndefined,
  validationDate: stringOrUndefined,
  vesselId: numberOrUndefined,
  vesselIdentifier: z.union([z.enum(VesselIdentifier), z.undefined()]),
  vesselName: stringOrUndefined
})
