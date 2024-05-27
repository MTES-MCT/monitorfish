/* eslint-disable typescript-sort-keys/string-enum */

export enum SeafrontGroup {
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  OUTREMEROA = 'OUTREMEROA',
  OUTREMEROI = 'OUTREMEROI',
  SA = 'SA'
}
export const ALL_SEAFRONT_GROUP = 'ALL'
export type AllSeafrontGroup = typeof ALL_SEAFRONT_GROUP
export const NO_SEAFRONT_GROUP = 'NONE'
export type NoSeafrontGroup = typeof NO_SEAFRONT_GROUP

export enum Seafront {
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

export const SEAFRONT_GROUP_SEAFRONTS: Record<SeafrontGroup, Seafront[]> = {
  MED: [Seafront.CORSE, Seafront.MED],
  MEMN: [Seafront.MEMN],
  NAMO: [Seafront.NAMO],
  OUTREMEROA: [Seafront.GUADELOUPE, Seafront.GUYANE, Seafront.MARTINIQUE],
  OUTREMEROI: [Seafront.MAYOTTE, Seafront.SUD_OCEAN_INDIEN],
  SA: [Seafront.SA]
}
