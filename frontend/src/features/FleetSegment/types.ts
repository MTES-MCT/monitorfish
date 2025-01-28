import { z } from 'zod'

export enum ScipSpeciesType {
  DEMERSAL = 'DEMERSAL',
  OTHER = 'OTHER',
  PELAGIC = 'PELAGIC',
  TUNA = 'TUNA'
}

export const FleetSegmentSchema = z.object({
  faoAreas: z.array(z.string()),
  gears: z.array(z.string()),
  impactRiskFactor: z.number().optional(),
  mainScipSpeciesType: z.nativeEnum(ScipSpeciesType).optional(),
  maxMesh: z.number().optional(),
  minMesh: z.number().optional(),
  minShareOfTargetSpecies: z.number().optional(),
  priority: z.number(),
  segment: z.string(),
  segmentName: z.string().optional(),
  targetSpecies: z.array(z.string()),
  vesselTypes: z.array(z.string()),
  year: z.number()
})

export type FleetSegment = z.infer<typeof FleetSegmentSchema>
