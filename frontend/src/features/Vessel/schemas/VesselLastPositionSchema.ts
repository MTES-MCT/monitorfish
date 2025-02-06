import { PendingAlertValueType } from '@features/Alert/types'
import { ReportingType } from '@features/Reporting/types'
import { Vessel } from '@features/Vessel/Vessel.types'
import { z } from 'zod'

import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from '../../../types'

import DeclaredLogbookSpeciesSchema = Vessel.DeclaredLogbookSpeciesSchema
import DeclaredLogbookGearSchema = Vessel.DeclaredLogbookGearSchema
import VesselIdentifier = Vessel.VesselIdentifier

export const VesselLastPositionSchema = z.strictObject({
  alerts: z.array(z.union([z.nativeEnum(PendingAlertValueType), z.literal('PNO_LAN_WEIGHT_TOLERANCE_ALERT')])),
  beaconMalfunctionId: numberOrUndefined,
  beaconNumber: numberOrUndefined,
  coordinates: z.array(z.number()),
  course: numberOrUndefined,
  dateTime: z.string(),
  departureDateTime: stringOrUndefined,
  destination: stringOrUndefined,
  detectabilityRiskFactor: z.number(),
  district: stringOrUndefined,
  districtCode: stringOrUndefined,
  emissionPeriod: numberOrUndefined,
  estimatedCurrentLatitude: numberOrUndefined,
  estimatedCurrentLongitude: numberOrUndefined,
  externalReferenceNumber: stringOrUndefined,
  filterPreview: z.number(), // 0 is False, 1 is True - for WebGL
  flagState: z.string(),
  from: stringOrUndefined,
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
  lastControlDateTimeTimestamp: numberOrUndefined,
  lastControlInfraction: booleanOrUndefined,
  lastLogbookMessageDateTime: stringOrUndefined,
  lastPositionSentAt: z.number(),
  latitude: z.number(),
  length: numberOrUndefined,
  longitude: z.number(),
  mmsi: stringOrUndefined,
  positionType: z.string(),
  postControlComment: stringOrUndefined,
  probabilityRiskFactor: z.number(),
  registryPortLocode: stringOrUndefined,
  registryPortName: stringOrUndefined,
  reportings: z.array(z.nativeEnum(ReportingType)),
  riskFactor: z.number(),
  segments: z.array(z.string()),
  speciesArray: z.array(z.string()),
  speciesOnboard: z.array(DeclaredLogbookSpeciesSchema),
  speed: numberOrUndefined,
  totalWeightOnboard: z.number(),
  tripNumber: stringOrUndefined,
  underCharter: booleanOrUndefined,
  vesselFeatureId: z.string(),
  vesselId: numberOrUndefined,
  vesselIdentifier: z.nativeEnum(VesselIdentifier),
  vesselName: stringOrUndefined,
  width: numberOrUndefined
})
