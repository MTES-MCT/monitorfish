import { ProducerOrganizationMembershipSchema } from '@features/ProducerOrganizationMembership/schemas/ProducerOrganizationMembershipSchema'
import { RiskFactorSchema } from '@features/RiskFactor/types'
import { BeaconSchema } from '@features/Vessel/schemas/BeaconSchema'
import { z } from 'zod'

import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from '../../../types'

export const VesselSchema = z.strictObject({
  beacon: z.union([BeaconSchema, z.undefined()]),
  declaredFishingGears: z.array(z.string()),
  district: stringOrUndefined,
  districtCode: stringOrUndefined,
  externalReferenceNumber: stringOrUndefined,
  flagState: z.string(),
  gauge: numberOrUndefined,
  hasLogbookEsacapt: z.boolean(),
  hasVisioCaptures: booleanOrUndefined,
  imo: stringOrUndefined,
  internalReferenceNumber: stringOrUndefined,
  ircs: stringOrUndefined,
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
  riskFactor: z.union([RiskFactorSchema, z.undefined()]),
  sailingCategory: stringOrUndefined,
  sailingType: stringOrUndefined,
  underCharter: booleanOrUndefined,
  vesselEmails: z.array(z.string()),
  vesselId: numberOrUndefined,
  vesselName: stringOrUndefined,
  vesselPhones: z.array(z.string()),
  vesselType: stringOrUndefined,
  width: numberOrUndefined
})
