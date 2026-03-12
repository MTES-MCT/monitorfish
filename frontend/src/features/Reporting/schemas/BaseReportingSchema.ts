import { InfractionSchema } from '@features/Infraction/schemas/InfractionSchema'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from 'types'
import z from 'zod'

export const BaseReportingSchema = z.strictObject({
  cfr: stringOrUndefined,
  createdBy: z.string(),
  creationDate: z.string(),
  expirationDate: stringOrUndefined,
  externalMarker: stringOrUndefined,
  flagState: z.string(),
  gearCode: stringOrUndefined,
  id: z.number(),
  imo: stringOrUndefined,
  infraction: z.union([InfractionSchema, z.undefined()]),
  ircs: stringOrUndefined,
  isArchived: z.boolean(),
  isDeleted: z.boolean(),
  isFishing: booleanOrUndefined,
  isIUU: z.boolean(),
  lastUpdateDate: z.string(),
  latitude: numberOrUndefined,
  length: numberOrUndefined,
  longitude: numberOrUndefined,
  mmsi: stringOrUndefined,
  reportingDate: z.string(),
  type: z.enum(ReportingType),
  underCharter: booleanOrUndefined,
  validationDate: stringOrUndefined,
  vesselId: numberOrUndefined,
  vesselIdentifier: z.union([z.enum(VesselIdentifier), z.undefined()]),
  vesselName: stringOrUndefined
})
