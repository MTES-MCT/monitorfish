/* eslint-disable typescript-sort-keys/string-enum */

export enum SeafrontGroup {
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  OUTREMEROA = 'OUTREMEROA',
  NO_FACADE = 'NO_FACADE',
  OUTREMEROI = 'OUTREMEROI',
  SA = 'SA'
}
export const ALL_SEAFRONT_GROUP = 'ALL'
export type AllSeafrontGroup = typeof ALL_SEAFRONT_GROUP

export enum Seafront {
  CORSE = 'Corse',
  GUADELOUPE = 'Guadeloupe',
  GUYANE = 'Guyane',
  OI_HORS_ZEE = 'Océan Indien Hors ZEE',
  LA_REUNION = 'La Réunion',
  MARTINIQUE = 'Martinique',
  MAYOTTE = 'Mayotte',
  MED = 'MED',
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  POLYNESIE_CLIPPERTON = 'Polynésie et Clipperton',
  SA = 'SA',
  SAINT_PIERRE_MIQUELON = 'Saint-Pierre et Miquelon',
  SAINT_MARTIN = 'Saint-Martin',
  SAINT_BARTHELEMY = 'Saint-Barthélemy',
  SUD_OCEAN_INDIEN = 'Sud Océan Indien',
  TAAF = 'TAAF'
}

export const SEAFRONT_GROUP_SEAFRONTS: Record<SeafrontGroup, Seafront[]> = {
  MED: [Seafront.CORSE, Seafront.MED],
  MEMN: [Seafront.MEMN],
  NAMO: [Seafront.NAMO],
  NO_FACADE: [Seafront.POLYNESIE_CLIPPERTON],
  OUTREMEROA: [
    Seafront.SAINT_PIERRE_MIQUELON,
    Seafront.SAINT_MARTIN,
    Seafront.SAINT_BARTHELEMY,
    Seafront.GUADELOUPE,
    Seafront.GUYANE,
    Seafront.MARTINIQUE
  ],
  OUTREMEROI: [Seafront.OI_HORS_ZEE, Seafront.LA_REUNION, Seafront.MAYOTTE, Seafront.SUD_OCEAN_INDIEN, Seafront.TAAF],
  SA: [Seafront.SA]
}

export function filterBySeafrontGroup<T>(
  items: T[],
  seafrontGroup: SeafrontGroup,
  getSeaFront: (item: T) => Seafront | undefined
): T[] {
  const seafronts = SEAFRONT_GROUP_SEAFRONTS[seafrontGroup]

  if (seafrontGroup === SeafrontGroup.NO_FACADE) {
    return items.filter(item => {
      const seaFront = getSeaFront(item)

      return !seaFront || seafronts.includes(seaFront)
    })
  }

  return items.filter(item => {
    const seaFront = getSeaFront(item)

    return seaFront !== undefined && seafronts.includes(seaFront)
  })
}
