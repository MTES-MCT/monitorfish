import { array, number, object, string } from 'yup'

export const FLEET_SEGMENT_FORM_SCHEMA = object().shape({
  bycatchSpecies: array(string()),
  faoAreas: array(string()),
  gears: array(string()),
  impactRiskFactor: number().min(1).max(4),
  segment: string()
    .required('Veuillez renseigner un nom de segment valide (sans espace).')
    .transform((value, originalValue) => (/\s/.test(originalValue) ? undefined : value)),
  segmentName: string(),
  targetSpecies: array(string()),
  year: number().required()
})
