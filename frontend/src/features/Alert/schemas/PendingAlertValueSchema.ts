import { Seafront } from '@constants/seafront'
import { PendingAlertValueType } from '@features/Alert/constants'
import { z } from 'zod'

export const PendingAlertValueSchema = z.strictObject({
  alertId: z.number().optional(),
  depth: z.number().optional(),
  description: z.string().optional(),
  dml: z.string().nullable().optional(),
  name: z.string(),
  natinfCode: z.number(),
  riskFactor: z.number().optional(),
  seaFront: z.enum(Seafront).optional(),
  speed: z.number().optional(),
  threat: z.string(),
  threatCharacterization: z.string(),
  type: z.enum(PendingAlertValueType)
})
