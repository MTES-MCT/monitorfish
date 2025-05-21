import { z } from 'zod'

export const VesselProfileSchema = z.strictObject({
  recentFaoAreas: z.record(z.number(), z.string()).optional(),
  recentGears: z.record(z.number(), z.string()).optional(),
  recentLandingPorts: z.record(z.number(), z.string()).optional(),
  recentSegments: z.record(z.number(), z.string()).optional(),
  recentSpecies: z.record(z.number(), z.string()).optional()
})
