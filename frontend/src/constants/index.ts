/* eslint-disable typescript-sort-keys/string-enum */

import type { Option } from '@mtes-mct/monitor-ui'

export const BOOLEAN_AS_OPTIONS: Array<Option<boolean>> = [
  { label: 'Oui', value: true },
  { label: 'Non', value: false }
]

export enum SeaFrontGroup {
  ALL = 'ALL',
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  OUTREMEROA = 'OUTREMEROA',
  OUTREMEROI = 'OUTREMEROI',
  SA = 'SA'
}

export enum SeaFrontGroupLabel {
  ALL = 'Toutes les missions',
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  SA = 'SA',
  OUTREMEROA = 'OUTRE-MER OA',
  OUTREMEROI = 'OUTRE-MER OI'
}

export enum SeaFront {
  GUADELOUPE = 'GUADELOUPE',
  GUYANE = 'GUYANE',
  MARTINIQUE = 'MARTINIQUE',
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  SA = 'SA',
  SUD_OCEAN_INDIEN = 'SUD_OCEAN_INDIEN'
}
export enum SeaFrontLabel {
  GUADELOUPE = 'Guadeloupe',
  GUYANE = 'Guyane',
  MARTINIQUE = 'Martinique',
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  SA = 'SA',
  SUD_OCEAN_INDIEN = 'Sud Océan Indien'
}

export const SEA_FRONT_GROUP_SEA_FRONTS: Record<SeaFrontGroup, SeaFront[]> = {
  [SeaFrontGroup.ALL]: [],
  [SeaFrontGroup.MED]: [SeaFront.MED],
  [SeaFrontGroup.MEMN]: [SeaFront.MEMN],
  [SeaFrontGroup.NAMO]: [SeaFront.NAMO],
  [SeaFrontGroup.OUTREMEROA]: [SeaFront.GUADELOUPE, SeaFront.GUYANE, SeaFront.MARTINIQUE],
  [SeaFrontGroup.OUTREMEROI]: [SeaFront.SUD_OCEAN_INDIEN],
  [SeaFrontGroup.SA]: [SeaFront.SA]
}
