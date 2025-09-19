import { PendingAlertValueType } from '@features/Alert/constants'
import { AdministrativeAreaType } from '@features/Alert/types'
import { VesselIdentitySchema } from '@features/Vessel/schemas/VesselIdentitySchema'
import { z } from 'zod'

import { stringOrUndefined, numberOrUndefined } from '../../../types'

export const GearSpecificationSchema = z.strictObject({
  gear: z.string(),
  maxMesh: numberOrUndefined,
  minMesh: numberOrUndefined
})

export const SpeciesSpecificationSchema = z.strictObject({
  minWeight: numberOrUndefined,
  species: z.string()
})

export const RegulatoryAreaSpecificationSchema = z.strictObject({
  lawType: stringOrUndefined,
  topic: stringOrUndefined,
  zone: stringOrUndefined
})

export const AdministrativeAreaSpecificationSchema = z.strictObject({
  areas: z.array(z.string()),
  areaType: z.nativeEnum(AdministrativeAreaType)
})

export const AlertSpecificationSchema = z.strictObject({
  administrativeAreas: z.array(AdministrativeAreaSpecificationSchema),
  createdAtUtc: z.string(),
  createdBy: z.string(),
  description: z.string(),
  districtCodes: z.array(z.string()),
  errorReason: stringOrUndefined,
  flagStatesIso2: z.array(z.string()),
  gears: z.array(GearSpecificationSchema),
  hasAutomaticArchiving: z.boolean(),
  id: numberOrUndefined,
  isActivated: z.boolean(),
  isInError: z.boolean(),
  isUserDefined: z.boolean(),
  minDepth: numberOrUndefined,
  name: z.string(),
  natinfCode: z.number(),
  onlyFishingPositions: z.boolean(),
  producerOrganizations: z.array(z.string()),
  regulatoryAreas: z.array(RegulatoryAreaSpecificationSchema),
  repeatEachYear: z.boolean(),
  species: z.array(SpeciesSpecificationSchema),
  speciesCatchAreas: z.array(z.string()),
  trackAnalysisDepth: z.number(),
  type: z.nativeEnum(PendingAlertValueType),
  validityEndDatetimeUtc: z.string().optional(),
  validityStartDatetimeUtc: z.string().optional(),
  vesselIds: z.array(z.number()),
  vessels: z.array(VesselIdentitySchema)
})
