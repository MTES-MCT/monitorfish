import { Seafront } from '@constants/seafront'
import { PendingAlertValueType } from '@features/Alert/constants'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import z from 'zod'

import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from '../../../types'

export const PendingAlertValueSchema = z.strictObject({
  alertId: z.number().optional(),
  depth: z.number().optional(),
  description: z.string().optional(),
  dml: z.string().nullable().optional(),
  name: z.string(),
  natinfCode: z.number().nullable().optional(),
  riskFactor: z.number().optional(),
  seaFront: z.enum(Seafront).optional(),
  speed: z.number().optional(),
  type: z.enum(PendingAlertValueType)
})

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
