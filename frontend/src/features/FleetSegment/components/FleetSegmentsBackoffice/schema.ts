import { ScipSpeciesType } from '@features/FleetSegment/types'
import { array, number, object, ObjectSchema, string, mixed } from 'yup'

import type { FleetSegment } from '@features/FleetSegment/types'

export const FLEET_SEGMENT_FORM_SCHEMA: ObjectSchema<FleetSegment> = object({
  faoAreas: array(string().required()).required().default([]),
  gears: array(string().required()).required().default([]),
  impactRiskFactor: number().min(1).max(4).required(),
  mainScipSpeciesType: mixed<ScipSpeciesType>().oneOf(Object.values(ScipSpeciesType)).default(undefined),
  maxMesh: number().default(undefined),
  minMesh: number().default(undefined),
  minShareOfTargetSpecies: number().default(undefined),
  priority: number().required('Veuillez renseigner une priorité.').default(undefined),
  segment: string()
    .required('Veuillez renseigner un nom de segment valide (sans espace).')
    .transform((value, originalValue) => (/\s/.test(originalValue) ? undefined : value))
    .default(undefined),
  segmentName: string().required(),
  targetSpecies: array(string().required()).required().default([]),
  vesselTypes: array(string().required()).required().default([]),
  year: number().required().default(undefined)
})
