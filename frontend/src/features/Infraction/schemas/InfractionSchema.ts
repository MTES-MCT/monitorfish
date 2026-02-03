import { z } from 'zod'

import { stringOrUndefined } from '../../../types'

export const InfractionSchema = z.strictObject({
  infraction: z.string(),
  infractionCategory: z.string(),
  natinfCode: z.number(),
  regulation: stringOrUndefined
})
