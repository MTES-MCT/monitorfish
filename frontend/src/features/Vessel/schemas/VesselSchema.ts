import { PendingAlertValueType } from '@features/Alert/types'
import { ProducerOrganizationMembershipSchema } from '@features/ProducerOrganizationMembership/schemas/ProducerOrganizationMembershipSchema'
import { ReportingType } from '@features/Reporting/types'
import { RiskFactorSchema } from '@features/RiskFactor/types'
import { VesselGroupSchema, VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { BeaconSchema } from '@features/Vessel/schemas/BeaconSchema'
import { z } from 'zod'

import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from '../../../types'

export const VesselSchema = z.strictObject({
  alerts: z.array(z.union([z.nativeEnum(PendingAlertValueType), z.literal('PNO_LAN_WEIGHT_TOLERANCE_ALERT')])),
  beacon: z.union([BeaconSchema, z.undefined()]),
  beaconMalfunctionId: z.number().optional(),
  course: z.number().optional(),
  declaredFishingGears: z.array(z.string()),
  district: stringOrUndefined,
  districtCode: stringOrUndefined,
  emissionPeriod: z.number().optional(),
  externalReferenceNumber: stringOrUndefined,
  flagState: z.string(),
  gauge: numberOrUndefined,
  hasAlert: z.boolean(),
  hasInfractionSuspicion: z.boolean(),
  hasLogbookEsacapt: z.boolean(),
  hasVisioCaptures: booleanOrUndefined,
  imo: stringOrUndefined,
  internalReferenceNumber: stringOrUndefined,
  ircs: stringOrUndefined,
  lastPositionCourse: z.number().optional(),
  lastPositionDateTime: z.string().optional(),
  lastPositionLatitude: z.number().optional(),
  // WSG84_PROJECTION
  lastPositionLongitude: z.number().optional(),

  // WSG84_PROJECTION
  lastPositionSpeed: z.number().optional(),

  length: numberOrUndefined,

  logbookEquipmentStatus: stringOrUndefined,

  logbookSoftware: stringOrUndefined,

  mmsi: stringOrUndefined,

  navigationLicenceExpirationDate: stringOrUndefined,

  navigationLicenceExtensionDate: stringOrUndefined,

  navigationLicenceStatus: stringOrUndefined,

  operatorEmail: stringOrUndefined,

  operatorName: stringOrUndefined,

  operatorPhones: z.array(z.string()),

  pinger: booleanOrUndefined,

  power: numberOrUndefined,

  producerOrganization: z.union([ProducerOrganizationMembershipSchema, z.undefined()]),

  proprietorEmails: z.array(z.string()),

  proprietorName: stringOrUndefined,
  proprietorPhones: z.array(z.string()),
  registryPort: stringOrUndefined,
  reportings: z.array(z.nativeEnum(ReportingType)),
  riskFactor: z.union([RiskFactorSchema, z.undefined()]),
  sailingCategory: stringOrUndefined,
  sailingType: stringOrUndefined,
  segments: z.array(z.string()).optional(),
  underCharter: booleanOrUndefined,
  vesselEmails: z.array(z.string()),
  vesselGroups: z.array(VesselGroupSchema),
  vesselId: numberOrUndefined,
  vesselIdentifier: z.nativeEnum(VesselIdentifier).optional(),
  vesselName: stringOrUndefined,
  vesselPhones: z.array(z.string()),
  vesselType: stringOrUndefined,
  width: numberOrUndefined
})
