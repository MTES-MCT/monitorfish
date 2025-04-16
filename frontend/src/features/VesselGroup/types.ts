import { VesselListFilterSchema } from '@features/Vessel/components/VesselList/types'
import { Vessel } from '@features/Vessel/Vessel.types'
import z from 'zod'

import { numberOrUndefined, stringOrUndefined } from '../../types'

export enum Sharing {
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED'
}

export enum GroupType {
  DYNAMIC = 'DYNAMIC',
  FIXED = 'FIXED'
}

export const VesselGroupSchema = z.strictObject({
  color: z.string().min(1),
  createdAtUtc: z.string().datetime(),
  createdBy: z.string(),
  description: z.union([z.string().max(255), z.undefined()]),
  endOfValidityUtc: z.union([z.string().datetime(), z.undefined()]),
  id: z.number(),
  isDeleted: z.boolean(),
  name: z.string().min(1).max(255),
  pointsOfAttention: stringOrUndefined,
  sharing: z.nativeEnum(Sharing),
  type: z.nativeEnum(GroupType),
  updatedAtUtc: z.union([z.string().datetime(), z.undefined()])
})

/**
 * Dynamic vessel group
 */

export const DynamicVesselGroupSchema = VesselGroupSchema.extend({
  filters: VesselListFilterSchema,
  type: z.literal(GroupType.DYNAMIC)
})

export const CreateOrUpdateDynamicVesselGroupSchema = DynamicVesselGroupSchema.omit({
  createdAtUtc: true,
  createdBy: true,
  updatedAtUtc: true
}).extend({
  id: z.union([z.number(), z.undefined()])
})

export type DynamicVesselGroup = z.infer<typeof DynamicVesselGroupSchema>
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
  vesselIdentifier: z.union([z.nativeEnum(Vessel.VesselIdentifier), z.undefined()])
})

export const FixedVesselGroupSchema = VesselGroupSchema.extend({
  type: z.literal(GroupType.FIXED),
  vessels: z.array(VesselIdentitySchema)
})

export const CreateOrUpdateFixedVesselGroupSchema = FixedVesselGroupSchema.omit({
  createdAtUtc: true,
  createdBy: true,
  updatedAtUtc: true
}).extend({
  id: z.union([z.number(), z.undefined()])
})

export type FixedVesselGroup = z.infer<typeof FixedVesselGroupSchema>
export type CreateOrUpdateFixedVesselGroup = z.infer<typeof CreateOrUpdateFixedVesselGroupSchema>
export type VesselIdentityForVesselGroup = z.infer<typeof VesselIdentitySchema>

export type VesselGroup = DynamicVesselGroup | FixedVesselGroup
export type CreateOrUpdateVesselGroup = CreateOrUpdateDynamicVesselGroup | CreateOrUpdateFixedVesselGroup
