import { z } from 'zod'

import { booleanOrUndefined, numberOrUndefined } from '../../../types'

export const SpeciesControlSchema = z.strictObject({
  controlledWeight: numberOrUndefined,
  declaredWeight: numberOrUndefined,
  nbFish: numberOrUndefined,
  speciesCode: z.string(),
  underSized: booleanOrUndefined
})
