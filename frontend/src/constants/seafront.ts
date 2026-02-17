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
  HORS_ZEE_OI = 'Hors ZEE Océan Indien ',
  LA_REUNION = 'La Réunion',
  MARTINIQUE = 'Martinique',
  MAYOTTE = 'Mayotte',
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  SA = 'SA',
  SAINT_PIERRE_MIQUELON = 'St Pierre et Miquelon',
  SAINT_MARTIN = 'St Martin',
  SAINT_BARTHELEMY = 'St Barthélémy ',
  SUD_OCEAN_INDIEN = 'Sud Océan Indien',
  TAAF = 'TAAF'
}

export const SEAFRONT_GROUP_SEAFRONTS: Record<SeafrontGroup, Seafront[]> = {
  MED: [Seafront.CORSE, Seafront.MED],
  MEMN: [Seafront.MEMN],
  NAMO: [Seafront.NAMO],
  OUTREMEROA: [
    Seafront.SAINT_PIERRE_MIQUELON,
    Seafront.SAINT_MARTIN,
    Seafront.SAINT_BARTHELEMY,
    Seafront.GUADELOUPE,
    Seafront.GUYANE,
    Seafront.MARTINIQUE
  ],
  OUTREMEROI: [Seafront.HORS_ZEE_OI, Seafront.LA_REUNION, Seafront.MAYOTTE, Seafront.SUD_OCEAN_INDIEN, Seafront.TAAF],
  SA: [Seafront.SA]
}
