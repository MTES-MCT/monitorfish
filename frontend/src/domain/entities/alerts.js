export const AlertTypes = {
  PNO_LAN_WEIGHT_TOLERANCE_ALERT: {
    code: 'PNO_LAN_WEIGHT_TOLERANCE_ALERT',
    name: 'Tolérance 10% non respectée',
    nameWithAlertDetails: (percentOfTolerance, minimumWeightThreshold) => {
      return `Tolérance de ${percentOfTolerance}% non respectée, appliquée pour un poids minimum de ${minimumWeightThreshold}kg.`
    }
  },
  THREE_MILES_TRAWLING_ALERT: {
    code: 'THREE_MILES_TRAWLING_ALERT',
    name: '3 milles - Chaluts'
  }
}

export const getAlertNameFromType = type => {
  return AlertTypes[type]
    ? AlertTypes[type].name
    : 'Alerte inconnue'
}

export const AlertsSubMenu = {
  MEMN: {
    name: 'MEMN',
    code: 'MEMN'
  },
  NAMO: {
    name: 'NAMO',
    code: 'NAMO'
  },
  SA: {
    name: 'SA',
    code: 'SA'
  },
  MED: {
    name: 'MED',
    code: 'MED'
  },
  OUTREMEROA: {
    name: 'OUTRE-MER OA',
    code: 'OUTREMEROA'
  },
  OUTREMEROI: {
    name: 'OUTRE-MER OI',
    code: 'OUTREMEROI'
  }
}

export const AlertsMenuSeaFrontsToSeaFrontList = {
  MEMN: {
    menuSeaFront: 'MEMN',
    seaFronts: ['MEMN']
  },
  SA: {
    menuSeaFront: 'SA',
    seaFronts: ['SA']
  },
  NAMO: {
    menuSeaFront: 'NAMO',
    seaFronts: ['NAMO']
  },
  MED: {
    menuSeaFront: 'MED',
    seaFronts: ['MED']
  },
  OUTREMEROA: {
    menuSeaFront: 'OUTREMEROA',
    seaFronts: ['Guadeloupe', 'Guyane', 'Martinique']
  },
  OUTREMEROI: {
    menuSeaFront: 'OUTREMEROI',
    seaFronts: ['Sud Océan Indien']
  }
}
