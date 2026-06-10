import { z } from 'zod'

import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from '../../../types'

export const SpeciesOnboardControlSchema = z.strictObject({
  controlledWeight: numberOrUndefined,
  declaredWeight: numberOrUndefined,
  faoZones: z.array(z.string()).optional(),
  isNotLanded: z.boolean().optional(),
  nbFish: numberOrUndefined,
  presentationCodes: z.array(z.string()).optional(),
  speciesCode: z.string(),
  speciesName: stringOrUndefined,
  underSized: booleanOrUndefined,
  underSizedWeight: numberOrUndefined
})
