export const WSG84_PROJECTION = 'EPSG:4326'
export const OPENLAYERS_PROJECTION = 'EPSG:3857'

export const getRiskFactorColor = riskFactor => {
  if (riskFactor >= 1 && riskFactor < 1.75) {
    return '#8E9A9F'
  }
  if (riskFactor >= 1.75 && riskFactor < 2.5) {
    return '#B89B8C'
  }
  if (riskFactor >= 2.5 && riskFactor < 3.25) {
    return '#CF6A4E'
  }
  if (riskFactor >= 3.25 && riskFactor <= 4) {
    return '#A13112'
  }
}

export const getImpactRiskFactorText = (riskFactor, hasSegment) => {
  if (riskFactor >= 1 && riskFactor < 1.75) {
    if (!hasSegment) {
      return 'Pas de segment'
    }

    return 'Impact faible'
  }
  if (riskFactor >= 1.75 && riskFactor < 2.5) {
    return 'Impact moyen'
  }
  if (riskFactor >= 2.5 && riskFactor < 3.25) {
    return 'Impact élevé'
  }
  if (riskFactor >= 3.25 && riskFactor <= 4) {
    return 'Impact très élevé'
  }
}

export const getProbabilityRiskFactorText = (riskFactor, hasBeenControlledLastFiveYears) => {
  if (riskFactor >= 1 && riskFactor < 1.75) {
    return 'Navire en règle'
  }
  if (riskFactor >= 1.75 && riskFactor < 2.5) {
    if (!hasBeenControlledLastFiveYears) {
      return "Absence d'antériorité de contrôle"
    }

    return 'Infractions occasionnelles'
  }
  if (riskFactor >= 2.5 && riskFactor < 3.25) {
    return 'Infractions répétées'
  }
  if (riskFactor >= 3.25 && riskFactor <= 4) {
    return 'Multirécidiviste'
  }
}

export const getDetectabilityRiskFactorText = (riskFactor, reducedText) => {
  if (riskFactor >= 1 && riskFactor < 1.75) {
    return `Priorité ${reducedText ? '' : 'de contrôle '}faible`
  }
  if (riskFactor >= 1.75 && riskFactor < 2.5) {
    return `Priorité ${reducedText ? '' : 'de contrôle '}moyenne`
  }
  if (riskFactor >= 2.5 && riskFactor < 3.25) {
    return `Priorité ${reducedText ? '' : 'de contrôle '}élevée`
  }
  if (riskFactor >= 3.25 && riskFactor <= 4) {
    return `Priorité ${reducedText ? '' : 'de contrôle '}très élevée`
  }
}

export const getControlPriorityLevel = riskFactor => {
  if (riskFactor >= 1 && riskFactor < 1.75) {
    return 'pas de segment'
  }
  if (riskFactor >= 1.75 && riskFactor < 2.5) {
    return 'moyenne'
  }
  if (riskFactor >= 2.5 && riskFactor < 3.25) {
    return 'élevée'
  }
  if (riskFactor >= 3.25 && riskFactor <= 4) {
    return 'très élevée'
  }
}

export const getControlRateRiskFactorText = controlRate => {
  if (controlRate >= 1 && controlRate < 1.75) {
    return 'Contrôles très réguliers'
  }
  if (controlRate >= 1.75 && controlRate < 2.5) {
    return 'Contrôles réguliers'
  }
  if (controlRate >= 2.5 && controlRate < 3.25) {
    return 'Contrôles occasionels'
  }
  if (controlRate >= 3.25 && controlRate < 4) {
    return 'Contrôles rares'
  }
  if (controlRate === 4) {
    return 'Contrôles très rares'
  }
}
