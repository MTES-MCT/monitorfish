import { PendingAlertValueType } from '@features/Alert/types'
import { ReportingType } from '@features/Reporting/types'
import { Vessel } from '@features/Vessel/Vessel.types'
import { z } from 'zod'

import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from '../../../types'

export const DeclaredLogbookGearSchema = z.strictObject({
  dimensions: stringOrUndefined,
  gear: stringOrUndefined,
  mesh: numberOrUndefined
})

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

export const VesselLastPositionSchema = z.strictObject({
  alerts: z.array(z.union([z.nativeEnum(PendingAlertValueType), z.literal('PNO_LAN_WEIGHT_TOLERANCE_ALERT')])),
  beaconMalfunctionId: numberOrUndefined,
  beaconNumber: numberOrUndefined,
  coordinates: z.array(z.number()), // OPENLAYERS_PROJECTION
  course: numberOrUndefined,
  dateTime: z.string(),
  detectabilityRiskFactor: z.number(),
  district: stringOrUndefined,
  districtCode: stringOrUndefined,
  emissionPeriod: numberOrUndefined,
  estimatedCurrentLatitude: numberOrUndefined,
  estimatedCurrentLongitude: numberOrUndefined,
  externalReferenceNumber: stringOrUndefined,
  flagState: z.string(),
  // TODO To remove
  gearOnboard: z.array(DeclaredLogbookGearSchema),
  gearsArray: z.array(z.string()),
  hasAlert: z.boolean(),
  hasBeaconMalfunction: z.boolean(),
  hasInfractionSuspicion: z.boolean(),
  id: numberOrUndefined,
  impactRiskFactor: z.number(),
  internalReferenceNumber: stringOrUndefined,
  ircs: stringOrUndefined,
  isAtPort: z.boolean(),
  isFiltered: z.number(), // 0 is False, 1 is True - for WebGL
  lastControlDateTime: stringOrUndefined,
  lastControlInfraction: booleanOrUndefined,
  lastLogbookMessageDateTime: stringOrUndefined,
  lastPositionSentAt: z.number(),
  latitude: z.number(), // WSG84_PROJECTION
  length: numberOrUndefined,
  longitude: z.number(), // WSG84_PROJECTION
  mmsi: stringOrUndefined,
  positionType: z.string(),
  probabilityRiskFactor: z.number(),
  // TODO To remove
  registryPortLocode: stringOrUndefined,
  // TODO To remove
  registryPortName: stringOrUndefined,
  reportings: z.array(z.nativeEnum(ReportingType)),
  riskFactor: z.number(),
  segments: z.array(z.string()),
  speciesArray: z.array(z.string()),
  // TODO Add speciesName
  speciesOnboard: z.array(DeclaredLogbookSpeciesSchema),
  speed: numberOrUndefined,
  underCharter: booleanOrUndefined,
  vesselFeatureId: z.string(),
  vesselGroups: z.array(VesselGroupSchema),
  vesselId: numberOrUndefined,
  vesselIdentifier: z.nativeEnum(Vessel.VesselIdentifier),
  vesselName: stringOrUndefined,
  // TODO To remove
  width: numberOrUndefined
})
