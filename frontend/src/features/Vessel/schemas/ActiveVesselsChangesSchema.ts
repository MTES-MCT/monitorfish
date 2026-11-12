import { z } from 'zod'

import { VesselGroupOfActiveVesselSchema } from './ActiveVesselSchema'

export const ActiveVesselPositionSchema = z.strictObject({
  coordinates: z.array(z.number()).nullable(), // OPENLAYERS_PROJECTION
  course: z.number().optional(),
  dateTime: z.string(),
  emissionPeriod: z.number().optional(),
  estimatedCurrentLatitude: z.number().optional(),
  estimatedCurrentLongitude: z.number().optional(),
  isAtPort: z.boolean(),
  lastPositionSentAt: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  positionType: z.string(),
  speed: z.number().optional(),
  vesselFeatureId: z.string()
})

/**
 * The active vessels are validated apart (sampled, see `vesselApi.getActiveVessels`).
 */
export const ActiveVesselsChangesSchema = z.strictObject({
  activeVesselsCount: z.number(),
  asOf: z.string(),
  fingerprint: z.number(),
  isFull: z.boolean(),
  positions: z.array(ActiveVesselPositionSchema),
  removedVesselFeatureIds: z.array(z.string()),
  vesselGroupIdsByVesselFeatureId: z.record(z.string(), z.array(z.number())),
  vesselGroups: z.array(VesselGroupOfActiveVesselSchema),
  vessels: z.array(z.unknown())
})
