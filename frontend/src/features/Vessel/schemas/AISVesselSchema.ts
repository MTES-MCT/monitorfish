import { z } from 'zod'

import { numberOrUndefined, stringOrUndefined } from '../../../types'

export const AISVesselSchema = z.strictObject({
  cfr: stringOrUndefined,
  coordinates: z.array(z.number()),
  course: numberOrUndefined,
  dateTime: z.string(),
  externalMarker: stringOrUndefined,
  flagState: z.string(),
  imo: stringOrUndefined,
  ircs: stringOrUndefined,
  isAtPort: z.boolean(),
  lastPositionSentAt: z.number(),
  latitude: z.number(),
  length: numberOrUndefined,
  longitude: z.number(),
  mmsi: z.number(),
  speed: numberOrUndefined,
  vesselFeatureId: z.string(),
  vesselName: stringOrUndefined
})
