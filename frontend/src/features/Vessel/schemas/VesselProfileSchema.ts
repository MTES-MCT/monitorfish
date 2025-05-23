import { z } from 'zod'

export const VesselProfileSchema = z.strictObject({
  faoAreas: z.record(z.string(), z.number()).optional(),
  gears: z.record(z.string(), z.number()).optional(),
  landingPorts: z.record(z.string(), z.number()).optional(),
  segments: z.record(z.string(), z.number()).optional(),
  species: z.record(z.string(), z.number()).optional()
})
