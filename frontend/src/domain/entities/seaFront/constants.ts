/* eslint-disable typescript-sort-keys/string-enum */

export enum SeaFrontGroup {
  ALL = 'ALL',
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  OUTREMEROA = 'OUTREMEROA',
  OUTREMEROI = 'OUTREMEROI',
  SA = 'SA'
}
export const NO_SEA_FRONT_GROUP = 'NO_SEA_FRONT_GROUP'
export type NoSeaFrontGroup = typeof NO_SEA_FRONT_GROUP

// TODO This should not be dedicated to Mission feature here.
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
  CORSE = 'Corse',
  GUADELOUPE = 'Guadeloupe',
  GUYANE = 'Guyane',
  MARTINIQUE = 'Martinique',
  MAYOTTE = 'Mayotte',
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  SA = 'SA',
  SUD_OCEAN_INDIEN = 'Sud Océan Indien'
}

export const SEA_FRONT_GROUP_SEA_FRONTS: Record<SeaFrontGroup, SeaFront[]> = {
  [SeaFrontGroup.ALL]: [],
  [SeaFrontGroup.MED]: [SeaFront.CORSE, SeaFront.MED],
  [SeaFrontGroup.MEMN]: [SeaFront.MEMN],
  [SeaFrontGroup.NAMO]: [SeaFront.NAMO],
  [SeaFrontGroup.OUTREMEROA]: [SeaFront.GUADELOUPE, SeaFront.GUYANE, SeaFront.MARTINIQUE],
  [SeaFrontGroup.OUTREMEROI]: [SeaFront.MAYOTTE, SeaFront.SUD_OCEAN_INDIEN],
  [SeaFrontGroup.SA]: [SeaFront.SA]
}
