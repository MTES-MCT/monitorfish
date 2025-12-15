import z from 'zod/index'

import type { ThreatSchema } from '@features/Infraction/schemas/Threat'

export type Threat = z.infer<typeof ThreatSchema>
