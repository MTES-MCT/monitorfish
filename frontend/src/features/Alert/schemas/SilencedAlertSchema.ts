import { PendingAlertValueSchema } from '@features/Alert/schemas/PendingAlertValueSchema'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import z from 'zod'

import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from '../../../types'

export const SilencedAlertSchema = z.strictObject({
  externalReferenceNumber: stringOrUndefined,
  flagState: z.string(),
  id: z.number(),
  internalReferenceNumber: stringOrUndefined,
  ircs: stringOrUndefined,
  isReactivated: booleanOrUndefined,
  silencedBeforeDate: z.string(),
  value: PendingAlertValueSchema,
  vesselId: numberOrUndefined,
  vesselIdentifier: z.union([z.enum(VesselIdentifier), z.undefined()]),
  vesselName: z.string()
})
