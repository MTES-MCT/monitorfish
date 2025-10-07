import { z } from 'zod'

import { numberOrUndefined } from '../../types'

export enum ScipSpeciesType {
  DEMERSAL = 'DEMERSAL',
  OTHER = 'OTHER',
  PELAGIC = 'PELAGIC',
  TUNA = 'TUNA'
}

export const FleetSegmentSchema = z.strictObject({
  faoAreas: z.array(z.string()),
  gears: z.array(z.string()),
  impactRiskFactor: z.number(),
  mainScipSpeciesType: z.enum(ScipSpeciesType).optional(),
  maxMesh: numberOrUndefined,
  minMesh: numberOrUndefined,
  minShareOfTargetSpecies: numberOrUndefined,
  priority: z.number(),
  segment: z.string(),
  segmentName: z.string(),
  targetSpecies: z.array(z.string()),
  vesselTypes: z.array(z.string()),
  year: z.number()
})

export type FleetSegment = z.infer<typeof FleetSegmentSchema>
