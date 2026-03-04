import { z } from 'zod'

import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from '../../../types'

export const GearControlSchema = z.strictObject({
  comments: stringOrUndefined,
  controlledMesh: numberOrUndefined,
  declaredMesh: numberOrUndefined,
  gearCode: z.string(),
  gearName: z.string(),
  gearWasControlled: booleanOrUndefined,
  hasUncontrolledMesh: z.boolean()
})
