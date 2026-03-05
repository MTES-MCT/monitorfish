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
  mmsi: stringOrUndefined,
  imo: stringOrUndefined,
  length: numberOrUndefined,
  latitude: numberOrUndefined,
  longitude: numberOrUndefined,
  flagState: z.string(),
  id: z.number(),
  infraction: z.union([InfractionSchema, z.undefined()]),
  ircs: stringOrUndefined,
  isArchived: z.boolean(),
  gearCode: stringOrUndefined,
  isFishing: booleanOrUndefined,
  isDeleted: z.boolean(),
  type: z.enum(ReportingType),
  underCharter: booleanOrUndefined,
  validationDate: stringOrUndefined,
  lastUpdateDate: z.string(),
  vesselId: numberOrUndefined,
  vesselIdentifier: z.union([z.enum(VesselIdentifier), z.undefined()]),
  vesselName: stringOrUndefined
})
