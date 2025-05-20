import { PendingAlertValueType } from '@features/Alert/types'
import { ReportingType } from '@features/Reporting/types'
import { z } from 'zod'

import { numberOrUndefined } from '../../../types'

export const DeclaredLogbookSpeciesSchema = z.strictObject({
  faoZone: z.string(),
  gear: z.string(),
  species: z.string(),
  weight: numberOrUndefined
})

export const VesselGroupSchema = z.strictObject({
  color: z.string(),
  id: z.number(),
  name: z.string()
})

export enum ActiveVesselType {
  LOGBOOK_ACTIVITY = 'LOGBOOK_ACTIVITY',
  POSITION_ACTIVITY = 'POSITION_ACTIVITY'
}

export enum VesselIdentifier {
  EXTERNAL_REFERENCE_NUMBER = 'EXTERNAL_REFERENCE_NUMBER',
  INTERNAL_REFERENCE_NUMBER = 'INTERNAL_REFERENCE_NUMBER',
  IRCS = 'IRCS'
}

const ActiveVesselBaseSchema = z.strictObject({
  activeVesselType: z.nativeEnum(ActiveVesselType),
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
  isFiltered: z.number(), // 0 is False, 1 is True - for WebGL
  lastControlDateTime: z.string().optional(),
  lastControlInfraction: z.boolean().optional(),
  lastLogbookMessageDateTime: z.string().optional(),
  length: z.number().optional(),
  mmsi: z.string().optional(),
  probabilityRiskFactor: z.number(),
  recentGearsArray: z.array(z.string()),
  recentSegments: z.array(z.string()),
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
  activeVesselType: z.literal('POSITION_ACTIVITY'),
  alerts: z.array(z.union([z.nativeEnum(PendingAlertValueType), z.literal('PNO_LAN_WEIGHT_TOLERANCE_ALERT')])),
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
  vesselGroups: z.array(VesselGroupSchema)
})

export const ActiveVesselEmittingLogbookSchema = ActiveVesselBaseSchema.extend({
  activeVesselType: z.literal('LOGBOOK_ACTIVITY')
})

export const ActiveVesselSchema = z.discriminatedUnion('activeVesselType', [
  ActiveVesselEmittingPositionSchema,
  ActiveVesselEmittingLogbookSchema
])
