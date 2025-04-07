import { VesselLocation } from '@features/Vessel/types/vessel'
import z from 'zod'

import { LastControlPeriod, VesselSize } from './constants'

import type { MultiPolygon, Polygon } from 'geojson'

export const ZoneFilterSchema = z.object({
  feature: z.union([z.custom<MultiPolygon>(), z.custom<Polygon>()]),
  label: z.string(),
  value: z.string()
})
export type ZoneFilter = z.infer<typeof ZoneFilterSchema>

export const VesselListFilterSchema = z.object({
  countryCodes: z.array(z.string()),
  districtCodes: z.array(z.string()),
  fleetSegments: z.array(z.string()),
  gearCodes: z.array(z.string()),
  hasLogbook: z.boolean().optional(),
  lastControlPeriod: z.union([z.nativeEnum(LastControlPeriod), z.undefined()]),
  lastLandingPortLocodes: z.array(z.string()),
  lastPositionHoursAgo: z.number().optional(),
  producerOrganizations: z.array(z.string()),
  riskFactors: z.array(z.number()),
  specyCodes: z.array(z.string()).optional(),
  vesselSize: z.union([z.nativeEnum(VesselSize), z.undefined()]),
  vesselsLocation: z.array(z.custom<VesselLocation>()),
  zones: z.array(ZoneFilterSchema)
})
export type VesselListFilter = z.infer<typeof VesselListFilterSchema>
