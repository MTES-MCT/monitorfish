/* eslint-disable typescript-sort-keys/string-enum */

export enum SeaFrontGroup {
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  OUTREMEROA = 'OUTREMEROA',
  OUTREMEROI = 'OUTREMEROI',
  SA = 'SA'
}
export const ALL_SEA_FRONT_GROUP = 'ALL_SEA_FRONT_GROUP'
export type AllSeaFrontGroup = typeof ALL_SEA_FRONT_GROUP
export const NO_SEA_FRONT_GROUP = 'NO_SEA_FRONT_GROUP'
export type NoSeaFrontGroup = typeof NO_SEA_FRONT_GROUP

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
  MED: [SeaFront.CORSE, SeaFront.MED],
  MEMN: [SeaFront.MEMN],
  NAMO: [SeaFront.NAMO],
  OUTREMEROA: [SeaFront.GUADELOUPE, SeaFront.GUYANE, SeaFront.MARTINIQUE],
  OUTREMEROI: [SeaFront.MAYOTTE, SeaFront.SUD_OCEAN_INDIEN],
  SA: [SeaFront.SA]
}
