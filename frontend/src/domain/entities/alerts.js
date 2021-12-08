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
    name: 'CHALUTAGE DANS LES 3 MILLES'
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
  NAMOSA: {
    name: 'NAMO / SA',
    code: 'NAMOSA'
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
  NAMOSA: {
    menuSeaFront: 'NAMOSA',
    seaFronts: ['NAMO', 'SA']
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
