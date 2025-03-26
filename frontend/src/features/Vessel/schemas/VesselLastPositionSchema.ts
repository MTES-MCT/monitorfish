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

export const VesselLastPositionSchema = z.strictObject({
  alerts: z.array(z.union([z.nativeEnum(PendingAlertValueType), z.literal('PNO_LAN_WEIGHT_TOLERANCE_ALERT')])),
  beaconMalfunctionId: numberOrUndefined,
  beaconNumber: numberOrUndefined,
  coordinates: z.array(z.number()), // OPENLAYERS_PROJECTION
  course: numberOrUndefined,
  dateTime: z.string(),
  // TODO To remove
  departureDateTime: stringOrUndefined,
  // TODO To remove
  destination: stringOrUndefined,
  detectabilityRiskFactor: z.number(),
  // TODO To remove
  district: stringOrUndefined,
  // TODO To remove
  districtCode: stringOrUndefined,
  emissionPeriod: numberOrUndefined,
  estimatedCurrentLatitude: numberOrUndefined,
  estimatedCurrentLongitude: numberOrUndefined,
  externalReferenceNumber: stringOrUndefined,
  flagState: z.string(),
  // TODO To remove
  from: stringOrUndefined,
  // TODO To remove
  gearOnboard: z.array(DeclaredLogbookGearSchema),
  gearsArray: z.array(z.string()),
  hasAlert: z.boolean(),
  hasBeaconMalfunction: z.boolean(),
  hasInfractionSuspicion: z.boolean(),
  impactRiskFactor: z.number(),
  internalReferenceNumber: stringOrUndefined,
  ircs: stringOrUndefined,
  isAtPort: z.boolean(),
  isFiltered: z.number(), // 0 is False, 1 is True - for WebGL
  lastControlDateTime: stringOrUndefined,
  // TODO To remove
  lastControlDateTimeTimestamp: numberOrUndefined,
  lastControlInfraction: booleanOrUndefined,
  lastLogbookMessageDateTime: stringOrUndefined,
  // TODO To remove
  lastPositionSentAt: z.number(),
  latitude: z.number(), // WSG84_PROJECTION
  length: numberOrUndefined,
  longitude: z.number(), // WSG84_PROJECTION
  mmsi: stringOrUndefined,
  // TODO To remove
  positionType: z.string(),
  // TODO To remove
  postControlComment: stringOrUndefined,
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
  // TODO To remove
  totalWeightOnboard: z.number(),
  // TODO To remove
  tripNumber: stringOrUndefined,
  underCharter: booleanOrUndefined,
  vesselFeatureId: z.string(),
  vesselId: numberOrUndefined,
  vesselIdentifier: z.nativeEnum(Vessel.VesselIdentifier),
  vesselName: stringOrUndefined,
  // TODO To remove
  width: numberOrUndefined
})
