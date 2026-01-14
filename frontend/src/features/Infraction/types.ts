import { InfractionSchema } from '@features/Infraction/schemas/InfractionSchema'
import { z } from 'zod'

import type { ThreatSchema } from '@features/Infraction/schemas/ThreatSchema'

export type Threat = z.infer<typeof ThreatSchema>

export type Infraction = z.infer<typeof InfractionSchema>
