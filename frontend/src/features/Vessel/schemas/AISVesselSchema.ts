import { z } from 'zod'

export const AISVesselSchema = z.strictObject({
  coordinates: z.array(z.number()),
  course: z.number().optional(),
  dateTime: z.string(),
  destination: z.string().optional(),
  externalMarker: z.string().optional(),
  imo: z.string().optional(),
  ircs: z.string().optional(),
  isAtPort: z.boolean(),
  lastPositionSentAt: z.number(),
  latitude: z.number(),
  length: z.number().optional(),
  longitude: z.number(),
  mmsi: z.number(),
  shipType: z.number().int().optional(),
  speed: z.number().optional(),
  vesselFeatureId: z.string(),
  vesselName: z.string().optional()
})
