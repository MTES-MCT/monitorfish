import { array, number, object, string } from 'yup'

export const FLEET_SEGMENT_FORM_SCHEMA = object().shape({
  faoAreas: array(string()),
  gears: array(string()),
  impactRiskFactor: number().min(1).max(4),
  mainScipSpeciesType: string(),
  maxMesh: number(),
  minMesh: number(),
  minShareOfTargetSpecies: number(),
  priority: number().required('Veuillez renseigner une priorité.'),
  segment: string()
    .required('Veuillez renseigner un nom de segment valide (sans espace).')
    .transform((value, originalValue) => (/\s/.test(originalValue) ? undefined : value)),
  segmentName: string(),
  targetSpecies: array(string()),
  vesselTypes: array(string()),
  year: number().required()
})
