import { z } from 'zod'

import { booleanOrUndefined, numberOrUndefined } from '../../../types'

export const SpeciesControlSchema = z.strictObject({
  controlledWeight: numberOrUndefined,
  declaredWeight: numberOrUndefined,
  discardReason: z.enum(['DIM', 'RET', 'DIS']).nullable().optional(),
  faoZones: z.array(z.string()).optional(),
  isNotLanded: z.boolean().optional(),
  nbFish: numberOrUndefined,
  presentationCode: z.string().nullable().optional(),
  rejectedWeight: numberOrUndefined,
  speciesCode: z.string(),
  underSized: booleanOrUndefined,
  underSizedWeight: numberOrUndefined
})
