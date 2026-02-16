import { z } from 'zod'

export const NatinfSchema = z.strictObject({
  label: z.string(),
  value: z.string()
})
