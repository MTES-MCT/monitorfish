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
  flagState: z.string(),
  from: stringOrUndefined,
  gearOnboard: z.array(DeclaredLogbookGearSchema),
  impactRiskFactor: z.number(),
  internalReferenceNumber: stringOrUndefined,
  ircs: stringOrUndefined,
  isAtPort: z.boolean(),
  lastControlDateTime: stringOrUndefined,
  lastControlInfraction: booleanOrUndefined,
  lastLogbookMessageDateTime: stringOrUndefined,
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
  speciesOnboard: z.array(DeclaredLogbookSpeciesSchema),
  speed: numberOrUndefined,
  totalWeightOnboard: z.number(),
  tripNumber: stringOrUndefined,
  underCharter: booleanOrUndefined,
  vesselId: numberOrUndefined,
  vesselIdentifier: z.nativeEnum(VesselIdentifier),
  vesselName: stringOrUndefined,
  width: numberOrUndefined
})
