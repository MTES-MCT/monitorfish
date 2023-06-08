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
  OUTREMEROA = 'OUTRE-MER OA',
  OUTREMEROI = 'OUTRE-MER OI',
  SA = 'SA'
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
