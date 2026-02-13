import { z } from 'zod'

import { ThreatSchema } from './ThreatSchema'
import { MissionAction } from '../missionAction.constants'

export const InfractionSchema = z.strictObject({
  comments: z.string(),
  infractionType: z.enum(MissionAction.InfractionType),
  natinf: z.number().optional(),
  natinfDescription: z.string().optional(),
  threat: z.string().optional(),
  threatCharacterization: z.string().optional(),
  threats: z.array(ThreatSchema).optional()
})
