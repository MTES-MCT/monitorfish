import { z } from 'zod'

import { NatinfSchema } from './NatinfSchema'

export const ThreatCharacterizationSchema = z.strictObject({
  children: z.array(NatinfSchema),
  label: z.string(),
  value: z.string()
})
