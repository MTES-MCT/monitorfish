import type { Option } from '@mtes-mct/monitor-ui'

export const BOOLEAN_AS_OPTIONS: Array<Option<boolean>> = [
  { label: 'Oui', value: true },
  { label: 'Non', value: false }
]

export enum SeaFront {
  GUADELOUPE = 'Guadeloupe',
  GUYANE = 'Guyane',
  MARTINIQUE = 'Martinique',
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  SA = 'SA',
  SUD_OCEAN_INDIEN = 'Sud Océan Indien'
}

export enum SeaFrontGroup {
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  OUTREMEROA = 'OUTRE-MER OA',
  OUTREMEROI = 'OUTRE-MER OI',
  SA = 'SA'
}

export const SEA_FRONT_GROUP_SEA_FRONTS: Record<SeaFrontGroup, SeaFront[]> = {
  [SeaFrontGroup.MED]: [SeaFront.MED],
  [SeaFrontGroup.MEMN]: [SeaFront.MEMN],
  [SeaFrontGroup.NAMO]: [SeaFront.NAMO],
  [SeaFrontGroup.OUTREMEROA]: [SeaFront.GUADELOUPE, SeaFront.GUYANE, SeaFront.MARTINIQUE],
  [SeaFrontGroup.OUTREMEROI]: [SeaFront.SUD_OCEAN_INDIEN],
  [SeaFrontGroup.SA]: [SeaFront.SA]
}
