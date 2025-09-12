import { PendingAlertValueType } from '@features/Alert/constants'
import { ProducerOrganizationMembershipSchema } from '@features/ProducerOrganizationMembership/schemas/ProducerOrganizationMembershipSchema'
import { ReportingType } from '@features/Reporting/types'
import { RiskFactorSchema } from '@features/RiskFactor/types'
import { ActivityOrigin, VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { BeaconSchema } from '@features/Vessel/schemas/BeaconSchema'
import { VesselProfileSchema } from '@features/Vessel/schemas/VesselProfileSchema'
import { DynamicVesselGroupSchema, FixedVesselGroupSchema } from '@features/VesselGroup/types'
import { z } from 'zod'

export const VesselSchema = z.strictObject({
  activityOrigin: z.nativeEnum(ActivityOrigin).optional(),
  alerts: z.array(z.nativeEnum(PendingAlertValueType)),
  beacon: BeaconSchema.optional(),
  beaconMalfunctionId: z.number().optional(),
  bossAddress: z.string().optional(),
  bossName: z.string().optional(),
  course: z.number().optional(),
  declaredFishingGears: z.array(z.string()),
  district: z.string().optional(),
  districtCode: z.string().optional(),
  emissionPeriod: z.number().optional(),
  externalReferenceNumber: z.string().optional(),
  flagState: z.string(),
  gauge: z.number().optional(),
  groups: z.array(z.union([FixedVesselGroupSchema, DynamicVesselGroupSchema])),
  hasAlert: z.boolean(),
  hasInfractionSuspicion: z.boolean(),
  hasLogbookEsacapt: z.boolean(),
  hasVisioCaptures: z.boolean().optional(),
  imo: z.string().optional(),
  internalReferenceNumber: z.string().optional(),
  ircs: z.string().optional(),
  lastPositionCourse: z.number().optional(),
  lastPositionDateTime: z.string().optional(),
  lastPositionLatitude: z.number().optional(), // WSG84_PROJECTION
  lastPositionLongitude: z.number().optional(), // WSG84_PROJECTION
  lastPositionSpeed: z.number().optional(),
  length: z.number().optional(),
  logbookEquipmentStatus: z.string().optional(),
  logbookSoftware: z.string().optional(),
  mmsi: z.string().optional(),
  navigationLicenceExpirationDate: z.string().optional(),
  navigationLicenceExtensionDate: z.string().optional(),
  navigationLicenceStatus: z.string().optional(),
  operatorEmail: z.string().optional(),
  operatorName: z.string().optional(),
  operatorPhones: z.array(z.string()),
  pinger: z.boolean().optional(),
  power: z.number().optional(),
  producerOrganization: ProducerOrganizationMembershipSchema.optional(),
  profile: VesselProfileSchema.optional(),
  proprietorEmails: z.array(z.string()),
  proprietorName: z.string().optional(),
  proprietorPhones: z.array(z.string()),
  registryPort: z.string().optional(),
  reportings: z.array(z.nativeEnum(ReportingType)),
  riskFactor: RiskFactorSchema,
  sailingCategory: z.string().optional(),
  sailingType: z.string().optional(),
  segments: z.array(z.string()),
  underCharter: z.boolean().optional(),
  vesselEmails: z.array(z.string()),
  vesselId: z.number().optional(),
  vesselIdentifier: z.nativeEnum(VesselIdentifier).optional(),
  vesselName: z.string().optional(),
  vesselPhones: z.array(z.string()),
  vesselType: z.string().optional(),
  width: z.number().optional()
})
