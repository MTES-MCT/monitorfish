export const WSG84_PROJECTION = 'EPSG:4326'
export const OPENLAYERS_PROJECTION = 'EPSG:3857'

export const getRiskFactorColor = riskFactor => {
  if (riskFactor >= 1 && riskFactor < 1.75) {
    return '#8E9A9F'
  } else if (riskFactor >= 1.75 && riskFactor < 2.5) {
    return '#B89B8C'
  } else if (riskFactor >= 2.5 && riskFactor < 3.25) {
    return '#CF6A4E'
  } else if (riskFactor >= 3.25 && riskFactor <= 4) {
    return '#A13112'
  }
}

export const getImpactRiskFactorText = (riskFactor) => {
  if (riskFactor >= 1 && riskFactor < 1.75) {
    return 'Impact faible'
  } else if (riskFactor >= 1.75 && riskFactor < 2.5) {
    return 'Impact moyen'
  } else if (riskFactor >= 2.5 && riskFactor < 3.25) {
    return 'Impact élevé'
  } else if (riskFactor >= 3.25 && riskFactor <= 4) {
    return 'Impact très élevé'
  }
}

export const getProbabilityRiskFactorText = (riskFactor, numberOfControls) => {
  if (riskFactor >= 1 && riskFactor < 1.75) {
    return 'Navire en règle'
  } else if (riskFactor >= 1.75 && riskFactor < 2.5) {
    if (!numberOfControls) {
      return 'Absence d\'antériorité de contrôle'
    }

    return 'Infractions occasionnelles'
  } else if (riskFactor >= 2.5 && riskFactor < 3.25) {
    return 'Infractions répétées'
  } else if (riskFactor >= 3.25 && riskFactor <= 4) {
    return 'Navire multirécidiviste'
  }
}

export const getDetectabilityRiskFactorText = (riskFactor, reducedText) => {
  if (riskFactor >= 1 && riskFactor < 1.75) {
    return `Priorité ${reducedText ? '' : 'de contrôle '}faible`
  } else if (riskFactor >= 1.75 && riskFactor < 2.5) {
    return `Priorité ${reducedText ? '' : 'de contrôle '}moyenne`
  } else if (riskFactor >= 2.5 && riskFactor < 3.25) {
    return `Priorité ${reducedText ? '' : 'de contrôle '}élevée`
  } else if (riskFactor >= 3.25 && riskFactor <= 4) {
    return `Priorité ${reducedText ? '' : 'de contrôle '}très élevée`
  }
}
