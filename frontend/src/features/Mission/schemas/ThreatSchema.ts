import { z } from 'zod'

import { ThreatCharacterizationSchema } from './ThreatCharacterizationSchema'

export const ThreatSchema = z.strictObject({
  children: z.array(ThreatCharacterizationSchema),
  label: z.string(),
  value: z.string()
})
