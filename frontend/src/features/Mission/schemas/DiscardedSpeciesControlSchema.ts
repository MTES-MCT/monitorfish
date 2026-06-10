import { z } from 'zod'

import { numberOrUndefined } from '../../../types'

export const DiscardedSpeciesControlSchema = z.strictObject({
  discardReason: z.enum(['DIM', 'RET', 'DIS']).nullable().optional(),
  faoZones: z.array(z.string()).optional(),
  rejectedWeight: numberOrUndefined,
  speciesCode: z.string()
})
