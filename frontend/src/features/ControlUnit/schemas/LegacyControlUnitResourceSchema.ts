import { z } from 'zod'

export const LegacyControlUnitResourceSchema = z.strictObject({
  id: z.number(),
  name: z.string()
})
