import type { DeclaredLogbookSpecies } from '../types'

// TODO Replace with theme colors.
export const getRiskFactorColor = (riskFactor: number) => {
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

  return undefined
}

export const getImpactRiskFactorText = (riskFactor: number, hasSegment: boolean = false) => {
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

  return undefined
}

export const getProbabilityRiskFactorText = (riskFactor: number, hasBeenControlledLastFiveYears: boolean = false) => {
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

  return undefined
}

export const getDetectabilityRiskFactorText = (riskFactor: number, isTextReduced: boolean = false) => {
  if (riskFactor >= 1 && riskFactor < 1.75) {
    return `Priorité ${isTextReduced ? '' : 'de contrôle '}faible`
  }
  if (riskFactor >= 1.75 && riskFactor < 2.5) {
    return `Priorité ${isTextReduced ? '' : 'de contrôle '}moyenne`
  }
  if (riskFactor >= 2.5 && riskFactor < 3.25) {
    return `Priorité ${isTextReduced ? '' : 'de contrôle '}élevée`
  }
  if (riskFactor >= 3.25 && riskFactor <= 4) {
    return `Priorité ${isTextReduced ? '' : 'de contrôle '}très élevée`
  }

  return undefined
}

export const getControlPriorityLevel = (riskFactor: number) => {
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

  return undefined
}

export const getControlRateRiskFactorText = (controlRate: number) => {
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

  return undefined
}

export function getFaoZonesFromSpeciesOnboard(speciesOnboard: Array<DeclaredLogbookSpecies>) {
  const faoZones = speciesOnboard.map(species => species.faoZone)

  return [...new Set(faoZones)]
}
