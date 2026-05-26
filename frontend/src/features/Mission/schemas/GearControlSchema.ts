import { z } from 'zod'

import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from '../../../types'
import { MissionAction as MissionActionConstants } from '../missionAction.constants'

export const GearControlSchema = z.strictObject({
  averageWireThickness: numberOrUndefined,
  comments: stringOrUndefined,
  controlledMesh: numberOrUndefined,
  declaredMesh: numberOrUndefined,
  gearCode: z.string(),
  gearMarkingIsCompliant: z.union([z.enum(MissionActionConstants.ControlCheck), z.undefined()]),
  gearName: z.string(),
  gearWasControlled: booleanOrUndefined,
  hasUncontrolledMesh: z.boolean(),
  wireType: z.union([z.enum(MissionActionConstants.WireType), z.undefined()])
})
