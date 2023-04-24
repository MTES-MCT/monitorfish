import type { Option } from '@mtes-mct/monitor-ui'

export const BOOLEAN_AS_OPTIONS: Array<Option<boolean>> = [
  { label: 'Oui', value: true },
  { label: 'Non', value: false }
]

// TODO Rename that to `SeaFrontGroup` and `SeaFrontGroupLabel`.
export enum SeaFront {
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  OUTREMEROA = 'OUTREMEROA',
  OUTREMEROI = 'OUTREMEROI',
  SA = 'SA'
}
export enum SeaFrontLabel {
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  OUTREMEROA = 'OUTRE-MER OA',
  OUTREMEROI = 'OUTRE-MER OI',
  SA = 'SA'
}

// TODO Rename that to `SeaFront` and `SeaFrontLabel`.
export enum NextSeaFront {
  GUADELOUPE = 'GUADELOUPE',
  GUYANE = 'GUYANE',
  MARTINIQUE = 'MARTINIQUE',
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  SA = 'SA',
  SUD_OCEAN_INDIEN = 'SUD_OCEAN_INDIEN'
}
export enum NextSeaFrontLabel {
  GUADELOUPE = 'Guadeloupe',
  GUYANE = 'Guyane',
  MARTINIQUE = 'Martinique',
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  SA = 'SA',
  SUD_OCEAN_INDIEN = 'Sud Océan Indien'
}

export const SEA_FRONT_GROUP_SEA_FRONTS: Record<SeaFront, NextSeaFront[]> = {
  [SeaFront.MED]: [NextSeaFront.MED],
  [SeaFront.MEMN]: [NextSeaFront.MEMN],
  [SeaFront.NAMO]: [NextSeaFront.NAMO],
  [SeaFront.OUTREMEROA]: [NextSeaFront.GUADELOUPE, NextSeaFront.GUYANE, NextSeaFront.MARTINIQUE],
  [SeaFront.OUTREMEROI]: [NextSeaFront.SUD_OCEAN_INDIEN],
  [SeaFront.SA]: [NextSeaFront.SA]
}
