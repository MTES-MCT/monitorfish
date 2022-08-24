import { getDate } from '../../utils'

export const AlertType = {
  FRENCH_EEZ_FISHING_ALERT: {
    code: 'FRENCH_EEZ_FISHING_ALERT',
    isOperationalAlert: true,
    name: 'Pêche en ZEE française par un navire tiers',
  },
  MISSING_FAR_ALERT: {
    code: 'MISSING_FAR_ALERT',
    isOperationalAlert: true,
    name: 'Non-emission de message "FAR"',
  },
  PNO_LAN_WEIGHT_TOLERANCE_ALERT: {
    code: 'PNO_LAN_WEIGHT_TOLERANCE_ALERT',
    isOperationalAlert: false,
    name: 'Tolérance 10% non respectée',
    nameWithAlertDetails: (percentOfTolerance, minimumWeightThreshold) =>
      `Tolérance de ${percentOfTolerance}% non respectée, appliquée pour un poids minimum de ${minimumWeightThreshold}kg.`,
  },
  THREE_MILES_TRAWLING_ALERT: {
    code: 'THREE_MILES_TRAWLING_ALERT',
    isOperationalAlert: true,
    name: '3 milles - Chaluts',
  },
  TWELVE_MILES_FISHING_ALERT: {
    code: 'TWELVE_MILES_FISHING_ALERT',
    isOperationalAlert: true,
    name: '12 milles - Pêche sans droits historiques',
  },
}

export const operationalAlertTypes = Object.keys(AlertType)
  .map(alertTypeName => AlertType[alertTypeName])
  .filter(alertType => alertType.isOperationalAlert)

export const getAlertNameFromType = type => (AlertType[type] ? AlertType[type].name : 'Alerte inconnue')

export const AlertsSubMenu = {
  MED: {
    code: 'MED',
    name: 'MED',
  },
  MEMN: {
    code: 'MEMN',
    name: 'MEMN',
  },
  NAMO: {
    code: 'NAMO',
    name: 'NAMO',
  },
  OUTREMEROA: {
    code: 'OUTREMEROA',
    name: 'OUTRE-MER OA',
  },
  OUTREMEROI: {
    code: 'OUTREMEROI',
    name: 'OUTRE-MER OI',
  },
  SA: {
    code: 'SA',
    name: 'SA',
  },
}

export const AlertsMenuSeaFrontsToSeaFrontList = {
  MED: {
    menuSeaFront: 'MED',
    seaFronts: ['MED'],
  },
  MEMN: {
    menuSeaFront: 'MEMN',
    seaFronts: ['MEMN'],
  },
  NAMO: {
    menuSeaFront: 'NAMO',
    seaFronts: ['NAMO'],
  },
  OUTREMEROA: {
    menuSeaFront: 'OUTREMEROA',
    seaFronts: ['Guadeloupe', 'Guyane', 'Martinique'],
  },
  OUTREMEROI: {
    menuSeaFront: 'OUTREMEROI',
    seaFronts: ['Sud Océan Indien'],
  },
  SA: {
    menuSeaFront: 'SA',
    seaFronts: ['SA'],
  },
}

export const SilencedAlertPeriod = {
  CUSTOM: 'CUSTOM',
  ONE_DAY: 'ONE_DAY',
  ONE_HOUR: 'ONE_HOUR',
  ONE_MONTH: 'ONE_MONTH',
  ONE_WEEK: 'ONE_WEEK',
  ONE_YEAR: 'ONE_YEAR',
  SIX_HOURS: 'SIX_HOURS',
  THIS_OCCURRENCE: 'THIS_OCCURRENCE',
  TWELVE_HOURS: 'TWELVE_HOURS',
  TWO_HOURS: 'TWO_HOURS',
}

export const getSilencedAlertPeriodText = silencedAlertPeriodRequest => {
  switch (silencedAlertPeriodRequest?.silencedAlertPeriod) {
    case SilencedAlertPeriod.THIS_OCCURRENCE: {
      return 'pour cette occurence'
    }
    case SilencedAlertPeriod.ONE_HOUR: {
      return 'pendant 1 heure'
    }
    case SilencedAlertPeriod.TWO_HOURS: {
      return 'pendant 2 heures'
    }
    case SilencedAlertPeriod.SIX_HOURS: {
      return 'pendant 6 heures'
    }
    case SilencedAlertPeriod.TWELVE_HOURS: {
      return 'pendant 12 heures'
    }
    case SilencedAlertPeriod.ONE_DAY: {
      return 'pendant 24 heures'
    }
    case SilencedAlertPeriod.ONE_WEEK: {
      return 'pendant 1 semaine'
    }
    case SilencedAlertPeriod.ONE_MONTH: {
      return 'pendant 1 mois'
    }
    case SilencedAlertPeriod.ONE_YEAR: {
      return 'pendant 1 année'
    }
    case SilencedAlertPeriod.CUSTOM: {
      return `du ${getDate(silencedAlertPeriodRequest.afterDateTime)} au ${getDate(
        silencedAlertPeriodRequest.beforeDateTime,
      )}`
    }
  }
}
