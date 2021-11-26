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
