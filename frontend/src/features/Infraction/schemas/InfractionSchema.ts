import { z } from 'zod'

export const InfractionSchema = z.strictObject({
  infraction: z.string(),
  infractionCategory: z.string(),
  natinfCode: z.number(),
  regulation: z.string()
})
