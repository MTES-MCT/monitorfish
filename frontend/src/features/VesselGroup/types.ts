import { VesselListFilterSchema } from '@features/Vessel/components/VesselList/types'
import { ActiveVesselSchema, VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { customDayjs } from '@mtes-mct/monitor-ui'
import z from 'zod'

import { numberOrUndefined, stringOrUndefined } from '../../types'

const validateDates = data => {
  const { endOfValidityUtc, startOfValidityUtc } = data
  if (!startOfValidityUtc || !endOfValidityUtc) {
    return true
  }

  return customDayjs(endOfValidityUtc).isAfter(customDayjs(startOfValidityUtc))
}

export enum Sharing {
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED'
}

export enum GroupType {
  DYNAMIC = 'DYNAMIC',
  FIXED = 'FIXED'
}

export enum CnspService {
  POLE_OPS_METROPOLE = 'POLE_OPS_METROPOLE',
  POLE_OPS_OUTRE_MER = 'POLE_OPS_OUTRE_MER',
  POLE_REG_PLANIF = 'POLE_REG_PLANIF',
  POLE_SIP = 'POLE_SIP'
}

export const VesselGroupSchema = z.strictObject({
  color: z.string().min(1),
  createdAtUtc: z.iso.datetime(),
  createdBy: z.string(),
  description: z.union([z.string().max(255), z.undefined()]),
  endOfValidityUtc: z.union([z.string().datetime(), z.undefined()]),
  id: z.number(),
  isDeleted: z.boolean(),
  name: z.string().min(1).max(255),
  pointsOfAttention: stringOrUndefined,
  sharedTo: z.union([z.array(z.enum(CnspService)), z.undefined()]),
  sharing: z.enum(Sharing),
  startOfValidityUtc: z.union([z.string().datetime(), z.undefined()]),
  type: z.enum(GroupType),
  updatedAtUtc: z.union([z.string().datetime(), z.undefined()])
})

/**
 * Dynamic vessel group
 */

export const VesselGroupFilterSchema = VesselListFilterSchema.omit({
  searchQuery: true
})
export type DynamicVesselGroupFilter = z.infer<typeof VesselGroupFilterSchema>

export const DynamicVesselGroupSchema = VesselGroupSchema.extend({
  filters: VesselGroupFilterSchema,
  type: z.literal(GroupType.DYNAMIC)
})

export const CreateOrUpdateDynamicVesselGroupSchema = DynamicVesselGroupSchema.omit({
  createdAtUtc: true,
  createdBy: true,
  updatedAtUtc: true
})
  .extend({
    id: z.union([z.number(), z.undefined()])
  })
  .refine(data => validateDates(data), {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['endOfValidityUtc']
  })

export type CreateOrUpdateDynamicVesselGroup = z.infer<typeof CreateOrUpdateDynamicVesselGroupSchema>

/**
 * Fixed vessel group
 */

export const VesselIdentitySchema = z.strictObject({
  cfr: stringOrUndefined,
  externalIdentification: stringOrUndefined,
  flagState: stringOrUndefined,
  ircs: stringOrUndefined,
  name: stringOrUndefined,
  vesselId: numberOrUndefined,
  vesselIdentifier: z.union([z.enum(VesselIdentifier), z.undefined()])
})

export const FixedVesselGroupSchema = VesselGroupSchema.extend({
  type: z.literal(GroupType.FIXED),
  vessels: z.array(VesselIdentitySchema)
})

export const CreateOrUpdateFixedVesselGroupSchema = FixedVesselGroupSchema.omit({
  createdAtUtc: true,
  createdBy: true,
  updatedAtUtc: true
})
  .extend({
    id: z.union([z.number(), z.undefined()])
  })
  .refine(data => validateDates(data), {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['endOfValidityUtc']
  })

export type FixedVesselGroup = z.infer<typeof FixedVesselGroupSchema>
export type DynamicVesselGroup = z.infer<typeof DynamicVesselGroupSchema>
export type CreateOrUpdateFixedVesselGroup = z.infer<typeof CreateOrUpdateFixedVesselGroupSchema>
export type VesselIdentityForVesselGroup = z.infer<typeof VesselIdentitySchema>

export type VesselGroup = DynamicVesselGroup | FixedVesselGroup
export type CreateOrUpdateVesselGroup = CreateOrUpdateDynamicVesselGroup | CreateOrUpdateFixedVesselGroup

export const VesselGroupWithVesselsSchema = z.strictObject({
  group: z.union([FixedVesselGroupSchema, DynamicVesselGroupSchema]),
  vessels: z.array(ActiveVesselSchema)
})

export type VesselGroupWithVessels = z.infer<typeof VesselGroupWithVesselsSchema>
