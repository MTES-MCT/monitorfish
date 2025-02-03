import { PendingAlertValueType } from '@features/Alert/types'
import { ReportingType } from '@features/Reporting/types'
import { Vessel } from '@features/Vessel/Vessel.types'
import { z } from 'zod'

import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from '../../../types'

import DeclaredLogbookSpeciesSchema = Vessel.DeclaredLogbookSpeciesSchema
import DeclaredLogbookGearSchema = Vessel.DeclaredLogbookGearSchema
import VesselIdentifier = Vessel.VesselIdentifier

// TODO Check which of these schemas are nullable or not
export const VesselLastPositionSchema = z.strictObject({
  alerts: z.array(z.union([z.nativeEnum(PendingAlertValueType), z.literal('PNO_LAN_WEIGHT_TOLERANCE_ALERT')])),
  beaconMalfunctionId: numberOrUndefined,
  beaconNumber: numberOrUndefined,
  course: numberOrUndefined,
  dateTime: z.string(),
  departureDateTime: stringOrUndefined,
  destination: stringOrUndefined,
  detectabilityRiskFactor: numberOrUndefined,
  district: stringOrUndefined,
  districtCode: stringOrUndefined,
  emissionPeriod: numberOrUndefined,
  estimatedCurrentLatitude: numberOrUndefined,
  estimatedCurrentLongitude: numberOrUndefined,
  externalReferenceNumber: stringOrUndefined,
  flagState: z.string(),
  from: stringOrUndefined,
  gearOnboard: z.array(DeclaredLogbookGearSchema),
  impactRiskFactor: numberOrUndefined,
  internalReferenceNumber: stringOrUndefined,
  ircs: stringOrUndefined,
  isAtPort: booleanOrUndefined,
  lastControlDateTime: stringOrUndefined,
  lastControlInfraction: booleanOrUndefined,
  lastLogbookMessageDateTime: stringOrUndefined,
  latitude: z.number(),
  length: numberOrUndefined,
  longitude: z.number(),
  mmsi: stringOrUndefined,
  positionType: z.string(),
  postControlComment: stringOrUndefined,
  probabilityRiskFactor: numberOrUndefined,
  registryPortLocode: stringOrUndefined,
  registryPortName: stringOrUndefined,
  reportings: z.array(z.nativeEnum(ReportingType)),
  riskFactor: numberOrUndefined,
  segments: z.array(z.string()),
  speciesOnboard: z.array(DeclaredLogbookSpeciesSchema),
  speed: numberOrUndefined,
  totalWeightOnboard: numberOrUndefined,
  tripNumber: stringOrUndefined,
  underCharter: booleanOrUndefined,
  vesselId: numberOrUndefined,
  vesselIdentifier: z.nativeEnum(VesselIdentifier),
  vesselName: stringOrUndefined,
  width: numberOrUndefined
})
