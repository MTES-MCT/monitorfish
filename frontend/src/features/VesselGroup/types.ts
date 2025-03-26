import { VesselListFilterSchema } from '@features/Vessel/components/VesselList/types'
import z from 'zod'

import { stringOrUndefined } from '../../types'

export enum Sharing {
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED'
}

export enum GroupType {
  DYNAMIC = 'DYNAMIC',
  FIXED = 'FIXED'
}

export const VesselGroupSchema = z.object({
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
