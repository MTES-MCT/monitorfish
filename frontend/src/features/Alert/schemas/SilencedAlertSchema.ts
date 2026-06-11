import { PendingAlertValueSchema } from '@features/Alert/schemas/PendingAlertValueSchema'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import z from 'zod'

import { booleanOptional, numberOrUndefined, stringOrUndefined } from '../../../types'

export const SilencedAlertSchema = z.strictObject({
  externalReferenceNumber: stringOrUndefined,
  flagState: z.string(),
  id: z.number(),
  internalReferenceNumber: stringOrUndefined,
  ircs: stringOrUndefined,
  isReactivated: booleanOptional,
  silencedBeforeDate: z.string(),
  value: PendingAlertValueSchema,
  vesselId: numberOrUndefined,
  vesselIdentifier: z.union([z.enum(VesselIdentifier), z.undefined()]),
  vesselName: stringOrUndefined
})
