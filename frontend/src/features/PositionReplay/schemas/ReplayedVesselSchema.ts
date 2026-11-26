import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { z } from 'zod'

export const ReplayedVesselSchema = z.strictObject({
  coordinates: z.array(z.number()).optional(), // OPENLAYERS_PROJECTION
  course: z.number().optional(),
  dateTime: z.string(),
  district: z.string().optional(),
  districtCode: z.string().optional(),
  externalReferenceNumber: z.string().optional(),
  flagState: z.string().optional(),
  internalReferenceNumber: z.string().optional(),
  ircs: z.string().optional(),
  isAtPort: z.boolean().optional(),
  latitude: z.number(), // WSG84_PROJECTION
  length: z.number().optional(),
  longitude: z.number(), // WSG84_PROJECTION
  mmsi: z.string().optional(),
  positionType: z.string(),
  producerOrganization: z.string().optional(),
  speed: z.number().optional(),
  underCharter: z.boolean().optional(),
  vesselFeatureId: z.string(),
  vesselId: z.number().optional(),
  vesselIdentifier: z.enum(VesselIdentifier),
  vesselName: z.string().optional()
})
