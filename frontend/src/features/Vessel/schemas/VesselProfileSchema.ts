import { z } from 'zod'

export const VesselProfileSchema = z.strictObject({
  recentFaoAreas: z.record(z.string(), z.number()).optional(),
  recentGears: z.record(z.string(), z.number()).optional(),
  recentLandingPorts: z.record(z.string(), z.number()).optional(),
  recentSegments: z.record(z.string(), z.number()).optional(),
  recentSpecies: z.record(z.string(), z.number()).optional()
})
