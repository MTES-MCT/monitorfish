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
  // Set by the e-ISR API only, and never edited in the mission form: it must survive the round-trip untouched
  toleranceMargin: numberOrUndefined,
  underSized: booleanOrUndefined,
  underSizedWeight: numberOrUndefined
})
