import { ReportingType } from '@features/Reporting/types'
import { z } from 'zod'

import { numberOrUndefined, stringOrUndefined } from '../../../types'

export const DeclaredLogbookSpeciesSchema = z.strictObject({
  faoZone: z.string(),
  gear: stringOrUndefined,
  mesh: numberOrUndefined,
  species: z.string(),
  weight: numberOrUndefined
})

export const VesselGroupOfActiveVesselSchema = z.strictObject({
  color: z.string(),
  id: z.number(),
  name: z.string()
})

export enum ActivityType {
  LOGBOOK_BASED = 'LOGBOOK_BASED',
  POSITION_BASED = 'POSITION_BASED'
}

export enum VesselIdentifier {
  EXTERNAL_REFERENCE_NUMBER = 'EXTERNAL_REFERENCE_NUMBER',
  INTERNAL_REFERENCE_NUMBER = 'INTERNAL_REFERENCE_NUMBER',
  IRCS = 'IRCS'
}

export enum ActivityOrigin {
  FROM_LOGBOOK = 'FROM_LOGBOOK',
  FROM_RECENT_PROFILE = 'FROM_RECENT_PROFILE'
}

const ActiveVesselBaseSchema = z.strictObject({
  activityOrigin: z.nativeEnum(ActivityOrigin),
  activityType: z.nativeEnum(ActivityType),
  detectabilityRiskFactor: z.number(),
  district: z.string().optional(),
  districtCode: z.string().optional(),
  externalReferenceNumber: z.string().optional(),
  flagState: z.string(),
  gearsArray: z.array(z.string()),
  hasInfractionSuspicion: z.boolean(),
  id: z.number().optional(),
  impactRiskFactor: z.number(),
  internalReferenceNumber: z.string().optional(),
  ircs: z.string().optional(),
  isAtPort: z.boolean(),
  // 0 is False, 1 is True - for WebGL
  isFiltered: z.number(),
  landingPortLocode: z.string().optional(),
  lastControlAtQuayDateTime: z.string().optional(),
  lastControlAtSeaDateTime: z.string().optional(),
  lastControlInfraction: z.boolean().optional(),
  lastLogbookMessageDateTime: z.string().optional(),
  length: z.number().optional(),
  mmsi: z.string().optional(),
  probabilityRiskFactor: z.number(),
  producerOrganization: z.string().optional(),
  reportings: z.array(z.nativeEnum(ReportingType)),
  riskFactor: z.number(),
  segments: z.array(z.string()),
  speciesArray: z.array(z.string()),
  speciesOnboard: z.array(DeclaredLogbookSpeciesSchema),
  underCharter: z.boolean().optional(),
  vesselFeatureId: z.string(),
  vesselId: z.number().optional(),
  vesselIdentifier: z.nativeEnum(VesselIdentifier),
  vesselName: z.string().optional()
})

export const ActiveVesselEmittingPositionSchema = ActiveVesselBaseSchema.extend({
  activityType: z.literal('POSITION_BASED'),
  alerts: z.array(z.string()),
  beaconMalfunctionId: numberOrUndefined,
  coordinates: z.array(z.number()), // OPENLAYERS_PROJECTION
  course: numberOrUndefined,
  dateTime: z.string(),
  emissionPeriod: z.number().optional(),
  estimatedCurrentLatitude: z.number().optional(),
  estimatedCurrentLongitude: z.number().optional(),
  hasAlert: z.boolean(),
  hasBeaconMalfunction: z.boolean(),
  lastPositionSentAt: z.number(),
  latitude: z.number(), // WSG84_PROJECTION
  longitude: z.number(), // WSG84_PROJECTION
  positionType: z.string(),
  speed: z.number().optional(),
  vesselGroups: z.array(VesselGroupOfActiveVesselSchema)
})

export const ActiveVesselEmittingLogbookSchema = ActiveVesselBaseSchema.extend({
  activityType: z.literal('LOGBOOK_BASED')
})

export const ActiveVesselSchema = z.discriminatedUnion('activityType', [
  ActiveVesselEmittingPositionSchema,
  ActiveVesselEmittingLogbookSchema
])
