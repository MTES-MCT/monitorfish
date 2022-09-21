import { getDate } from '../../utils'
import Fuse from 'fuse.js'
import _ from 'lodash'

export const AlertType = {
  PNO_LAN_WEIGHT_TOLERANCE_ALERT: {
    code: 'PNO_LAN_WEIGHT_TOLERANCE_ALERT',
    name: 'Tolérance 10% non respectée',
    isOperationalAlert: false,
    nameWithAlertDetails: (percentOfTolerance, minimumWeightThreshold) => {
      return `Tolérance de ${percentOfTolerance}% non respectée, appliquée pour un poids minimum de ${minimumWeightThreshold}kg.`
    }
  },
  THREE_MILES_TRAWLING_ALERT: {
    code: 'THREE_MILES_TRAWLING_ALERT',
    name: '3 milles - Chaluts',
    isOperationalAlert: true
  },
  FRENCH_EEZ_FISHING_ALERT: {
    code: 'FRENCH_EEZ_FISHING_ALERT',
    name: 'Pêche en ZEE française par un navire tiers',
    isOperationalAlert: true
  },
  TWELVE_MILES_FISHING_ALERT: {
    code: 'TWELVE_MILES_FISHING_ALERT',
    name: '12 milles - Pêche sans droits historiques',
    isOperationalAlert: true
  },
  MISSING_FAR_ALERT: {
    code: 'MISSING_FAR_ALERT',
    name: 'Non-emission de message "FAR"',
    isOperationalAlert: true
  }
}

export const operationalAlertTypes = Object.keys(AlertType)
  .map(alertTypeName => AlertType[alertTypeName])
  .filter(alertType => alertType.isOperationalAlert)

export const getAlertNameFromType = type => {
  return AlertType[type]
    ? AlertType[type].name
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

export const SilencedAlertPeriod = {
  THIS_OCCURRENCE: 'THIS_OCCURRENCE',
  ONE_HOUR: 'ONE_HOUR',
  TWO_HOURS: 'TWO_HOURS',
  SIX_HOURS: 'SIX_HOURS',
  TWELVE_HOURS: 'TWELVE_HOURS',
  ONE_DAY: 'ONE_DAY',
  ONE_WEEK: 'ONE_WEEK',
  ONE_MONTH: 'ONE_MONTH',
  ONE_YEAR: 'ONE_YEAR',
  CUSTOM: 'CUSTOM'
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
      return `du ${getDate(silencedAlertPeriodRequest.afterDateTime)} au ${getDate(silencedAlertPeriodRequest.beforeDateTime)}`
    }
  }
}

const alertTypeKey = ["value", "type"]
export const alertSearchOptions = {
  includeScore: true,
  distance: 50,
  threshold: 0.4,
  keys: [
    'vesselName',
    'internalReferenceNumber',
    'externalReferenceNumber',
    'ircs',
    alertTypeKey,
  ],
  getFn: (alert, path) => {
    const value = Fuse.config.getFn(alert, path)

    if (_.isEqual(path,alertTypeKey)) {
      return getAlertNameFromType(alert.value.type)
    }

    return value
  }
}
