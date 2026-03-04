import { z } from 'zod'

import { LegacyControlUnitResourceSchema } from './LegacyControlUnitResourceSchema'
import { stringOrUndefined } from '../../../types'

export const LegacyControlUnitSchema = z.strictObject({
  administration: z.string(),
  contact: stringOrUndefined,
  id: z.number(),
  isArchived: z.boolean(),
  name: z.string(),
  resources: z.array(LegacyControlUnitResourceSchema)
})
