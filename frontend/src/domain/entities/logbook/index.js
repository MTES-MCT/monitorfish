import { Feature } from 'ol'
import Point from 'ol/geom/Point'
import { getFishingActivityCircleStyle } from '../../../features/map/layers/styles/vesselTrack.style'
import { LayerProperties } from '../layers/constants'

export const LogbookMessageType = {
  DEP: {
    code: 'DEP',
    displayCode: 'DEP',
    name: 'Départ'
  },
  FAR: {
    code: 'FAR',
    displayCode: 'FAR',
    name: 'Captures',
    fullName: 'Déclaration de capture'
  },
  PNO: {
    code: 'PNO',
    displayCode: 'PNO',
    name: 'Préavis',
    fullName: 'Préavis (notification de retour au port)'
  },
  LAN: {
    code: 'LAN',
    displayCode: 'LAN',
    name: 'Débarquement',
    fullName: 'Débarquement'
  },
  RTP: {
    code: 'RTP',
    displayCode: 'RTP',
    name: 'Retour au port',
    fullName: 'Retour au port'
  },
  EOF: {
    code: 'EOF',
    displayCode: 'EOF',
    name: 'Fin de la marée',
    fullName: 'Fin de pêche'
  },
  COE: {
    code: 'COE',
    displayCode: 'COE',
    fullName: 'Entrée dans une zone d\'effort',
    name: 'Entrée dans une zone d\'effort'
  },
  NOT_COE: {
    code: 'NOT_COE',
    displayCode: 'COE',
    fullName: 'Notification d\'entrée dans une zone d\'effort',
    name: 'Notification d\'entrée dans une zone d\'effort'
  },
  COX: {
    code: 'COX',
    displayCode: 'COX',
    name: 'Sortie d\'une zone d\'effort',
    fullName: 'Sortie d\'une zone d\'effort'
  },
  NOT_COX: {
    code: 'NOT_COX',
    displayCode: 'COX',
    fullName: 'Notification de sortie d\'une zone d\'effort',
    name: 'Notification de sortie d\'une zone d\'effort'
  },
  JFO: {
    code: 'JFO',
    displayCode: 'JFO',
    fullName: 'Opération de pêche conjointe',
    name: 'Opération de pêche conjointe'
  },
  CRO: {
    code: 'CRO',
    displayCode: 'CRO',
    name: 'Traversée d\'une zone d\'effort',
    fullName: 'Traversée d\'une zone d\'effort'
  },
  DIS: {
    code: 'DIS',
    displayCode: 'DIS',
    name: 'Rejets',
    fullName: 'Déclaration de rejets'
  },
  DIM: {
    code: 'DIM',
    displayCode: 'DIM',
    name: 'Rejets minimis'
  },
  RLC: {
    code: 'RLC',
    displayCode: 'RLC',
    fullName: 'Déclaration de transfert',
    name: 'Transfert'
  },
  TRA: {
    code: 'TRA',
    displayCode: 'TRA',
    fullName: 'Déclaration de transbordement',
    name: 'Transbordement'
  },
  NOT_TRA: {
    code: 'NOT_TRA',
    displayCode: 'TRA',
    fullName: 'Notification de transbordement',
    name: 'Notification de transbordement'
  },
  GEAR_SHOT: {
    code: 'GEAR_SHOT',
    displayCode: 'SHT',
    fullName: 'Mise à l\'eau d\'engin',
    name: 'Mise à l\'eau d\'engin'
  },
  GEAR_RETRIEVAL: {
    code: 'GEAR_RETRIEVAL',
    displayCode: 'RTV',
    fullName: 'Sortie de l\'eau d`engin',
    name: 'Sortie de l\'eau d`engin'
  },
  START_ACTIVITY: {
    code: 'START_ACTIVITY',
    displayCode: 'STA',
    fullName: 'Début d\'activité de pêche',
    name: 'Début d\'activité de pêche'
  },
  START_FISHING: {
    code: 'START_FISHING',
    displayCode: 'STF',
    fullName: 'Début de pêche',
    name: 'Début de pêche'
  },
  TRZ: {
    code: 'TRZ',
    displayCode: 'TRZ',
    fullName: 'Pêche trans-zone',
    name: 'Pêche trans-zone'
  },
  INS: {
    code: 'INS',
    displayCode: 'INS',
    fullName: 'Déclaration d\'inspection',
    name: 'Inspection'
  },
  PNT: {
    code: 'PNT',
    displayCode: 'PNT',
    fullName: 'Pré-notification de transfert',
    name: 'Pré-notification de transfert'
  }
}

export const LogbookOperationType = {
  DAT: 'DAT',
  COR: 'COR'
}

export const LogbookMessageActivityType = {
  FSH: 'Pêche'
}

export const LogbookMessageSender = {
  MAS: 'Capitaine'
}

export const LogbookMessagePNOPurposeType = {
  SHE: 'Mise à l\'abri',
  LAN: 'Débarquement'
}

export const LogbookSpeciesPreservationState = {
  ALI: 'Vivant',
  BOI: 'Ébouillanté',
  DRI: 'Séché',
  FRE: 'Frais',
  FRO: 'Congelé',
  SAL: 'Salé'
}

export const LogbookSpeciesPresentation = {
  CBF: 'Double filet de cabillaud avec peau (escalado)',
  CLA: 'Pinces',
  DWT: 'Code CICTA',
  FIL: 'En filets',
  FIS: 'En filets et filets sans peau',
  FSB: 'En filets avec peau et arêtes',
  FSP: 'En filets dépouillé avec arête intramusculaire',
  GHT: 'Éviscéré étêté et équeuté',
  GUG: 'Éviscéré et sans branchies',
  GUH: 'Éviscéré et étêté',
  GUL: 'Éviscéré avec le foie',
  GUS: 'Éviscéré étêté et sans peau',
  GUT: 'Éviscéré',
  HEA: 'Étêté',
  JAP: 'Découpe japonaise',
  JAT: 'Découpe japonaise et équeuté',
  LAP: 'Lappen',
  LVR: 'Foie',
  OTH: 'Autres',
  ROE: 'Œuf(s)',
  SAD: 'Salé à sec',
  SAL: 'Légèrement salé en saumure',
  SGH: 'Salé éviscéré et étêté',
  SGT: 'Salé et éviscéré',
  SKI: 'Dépouillé',
  SUR: 'Surimi',
  TAL: 'Queue',
  TLD: 'Équeuté',
  TNG: 'Langue',
  TUB: 'Corps cylindrique uniquement',
  WHL: 'Entier',
  WNG: 'Ailerons'
}

function getPropertiesObject (logbookCatch) {
  return {
    weight: logbookCatch.weight,
    faoZone: logbookCatch.faoZone,
    conversionFactor: logbookCatch.conversionFactor,
    packaging: logbookCatch.packaging,
    effortZone: logbookCatch.effortZone,
    presentation: logbookCatch.presentation,
    economicZone: logbookCatch.economicZone,
    preservationState: logbookCatch.preservationState,
    statisticalRectangle: logbookCatch.statisticalRectangle
  }
}

export const buildCatchArray = catches => {
  const notFound = -1

  return catches.reduce((accumulator, logbookCatch) => {
    const sameSpeciesIndex = accumulator.findIndex(accCatch => {
      return accCatch.species === logbookCatch.species
    })

    if (sameSpeciesIndex === notFound) {
      accumulator.push({
        species: logbookCatch.species,
        speciesName: logbookCatch.speciesName,
        weight: logbookCatch.weight ? logbookCatch.weight : 0,
        properties: [
          getPropertiesObject(logbookCatch)
        ]
      })
    } else {
      accumulator[sameSpeciesIndex].properties.push(getPropertiesObject(logbookCatch))
      accumulator[sameSpeciesIndex].weight += logbookCatch.weight ? parseFloat(logbookCatch.weight) : 0
    }
    return accumulator.sort((catchA, catchB) => catchB.weight - catchA.weight)
  }, [])
}
export const getDEPMessageFromMessages = logbookMessages => logbookMessages
  .find(message => message.messageType === LogbookMessageType.DEP.code)
export const getDISMessagesFromMessages = logbookMessages => logbookMessages
  .filter(message => message.messageType === LogbookMessageType.DIS.code)
export const getPNOMessageFromMessages = logbookMessages => logbookMessages
  .find(message => message.messageType === LogbookMessageType.PNO.code)
export const getFARMessagesFromMessages = logbookMessages => logbookMessages
  .filter(message => message.messageType === LogbookMessageType.FAR.code)
export const getLANMessageFromMessages = logbookMessages => {
  return logbookMessages
    .find(message => message.messageType === LogbookMessageType.LAN.code)
}

function sortByCorrectedMessagesFirst () {
  return (x, y) => {
    if (x.operationType === LogbookOperationType.COR) {
      return -1
    }

    if (y.operationType === LogbookOperationType.COR) {
      return 1
    }

    return 0
  }
}

export const getTotalDISWeightFromMessages = logbookMessages => {
  let correctedMessagesReferencedIds = []
  return parseFloat(logbookMessages
    .sort(sortByCorrectedMessagesFirst())
    .reduce((accumulator, logbookMessage) => {
      if (logbookMessage.operationType === LogbookOperationType.COR) {
        correctedMessagesReferencedIds = correctedMessagesReferencedIds.concat(logbookMessage.referencedReportId)
      }
      const sumOfCatches = !correctedMessagesReferencedIds.includes(logbookMessage.reportId) && logbookMessage.acknowledge && logbookMessage.acknowledge.isSuccess
        ? logbookMessage.message.catches.reduce((subAccumulator, speciesCatch) => {
          return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
        }, 0)
        : 0
      return accumulator + sumOfCatches
    }, 0).toFixed(1))
}

export const getAllFAROrDISMessagesAreNotAcknowledged = logbookMessages =>
  logbookMessages.length === logbookMessages.filter(logbookMessage => !logbookMessage?.acknowledge?.isSuccess).length

export const getTotalFARWeightFromMessages = logbookMessages => {
  let correctedMessagesReferencedIds = []

  return parseFloat(logbookMessages
    .sort(sortByCorrectedMessagesFirst())
    .reduce((accumulator, logbookMessage) => {
      if (logbookMessage.operationType === LogbookOperationType.COR) {
        correctedMessagesReferencedIds = correctedMessagesReferencedIds.concat(logbookMessage.referencedReportId)
      }

      const sumOfCatches = !correctedMessagesReferencedIds.includes(logbookMessage.reportId) && logbookMessage.acknowledge && logbookMessage.acknowledge.isSuccess
        ? logbookMessage.message.hauls.reduce((subAccumulator, haul) => {
          return subAccumulator + (haul.catches.reduce((haulAccumulator, speciesCatch) => {
            return haulAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
          }, 0))
        }, 0)
        : 0
      return accumulator + sumOfCatches
    }, 0).toFixed(1))
}

export const getTotalDEPWeightFromMessage = logbookMessage => {
  return getSumOfCatchWeights(logbookMessage.message.speciesOnboard, false)
}

export const getTotalLANWeightFromMessage = logbookMessage => {
  return getSumOfCatchWeights(logbookMessage.message.catchLanded, true)
}

export const getTotalPNOWeightFromMessage = logbookMessage => {
  return getSumOfCatchWeights(logbookMessage.message.catchOnboard, false)
}

function getSumOfCatchWeights (arrayOfCatches, hasConversionFactorApplied = false) {
  const sum = arrayOfCatches.reduce((subAccumulator, speciesCatch) => {
    const conversionFactor = hasConversionFactorApplied && speciesCatch.conversionFactor
      ? speciesCatch.conversionFactor
      : 1

    return subAccumulator + ((speciesCatch.weight * conversionFactor) || 0)
  }, 0)

  return parseFloat(sum.toFixed(1))
}

function setSpeciesToWeightObject (speciesToWeightObject, speciesCatch, totalWeight, hasConversionFactorApplied) {
  const conversionFactor = hasConversionFactorApplied && speciesCatch.conversionFactor ? speciesCatch.conversionFactor : 1

  if (speciesToWeightObject[speciesCatch.species]) {
    speciesToWeightObject[speciesCatch.species].weight = parseFloat((
      speciesToWeightObject[speciesCatch.species].weight +
      multiplyByConversionFactorIfNeeded(speciesCatch.weight, conversionFactor)).toFixed(1))
  } else {
    speciesToWeightObject[speciesCatch.species] = {
      species: speciesCatch.species,
      weight:  multiplyByConversionFactorIfNeeded(speciesCatch.weight, conversionFactor),
      speciesName: speciesCatch.speciesName,
      totalWeight: totalWeight
    }
  }
}

function multiplyByConversionFactorIfNeeded (weight, conversionFactor = 1) {
  if (!weight) {
    return 0
  }

  const weightWithConversionFactor = weight * conversionFactor

  return parseFloat(weightWithConversionFactor.toFixed(1))
}

function getSpeciesObject (speciesCatch) {
  return {
    species: speciesCatch.species,
    presentation: speciesCatch.presentation,
    weight: speciesCatch.weight ? parseFloat(speciesCatch.weight.toFixed(1)) : 0,
    speciesName: speciesCatch.speciesName
  }
}

function getSpeciesAndPresentationToWeightObject (speciesToWeightObject, speciesCatch) {
  if (speciesToWeightObject[speciesCatch.species] &&
    speciesToWeightObject[speciesCatch.species].length &&
    speciesToWeightObject[speciesCatch.species].find(species => species.presentation === speciesCatch.presentation)) {
    speciesToWeightObject[speciesCatch.species] = speciesToWeightObject[speciesCatch.species].map(speciesAndPresentation => {
      if (speciesAndPresentation.presentation === speciesCatch.presentation) {
        speciesAndPresentation.weight = parseFloat((
          speciesAndPresentation.weight +
          (speciesCatch.weight ? parseFloat(speciesCatch.weight) : 0)).toFixed(1))
      }

      return speciesAndPresentation
    })
  } else if (speciesToWeightObject[speciesCatch.species] && speciesToWeightObject[speciesCatch.species].length) {
    speciesToWeightObject[speciesCatch.species].push(getSpeciesObject(speciesCatch))
  } else {
    speciesToWeightObject[speciesCatch.species] = [getSpeciesObject(speciesCatch)]
  }
}

export const getFARSpeciesToWeightObject = (messages, totalWeight) => {
  const speciesToWeightObject = {}
  let correctedMessagesReferencedIds = []

  messages
    .sort(sortByCorrectedMessagesFirst())
    .forEach(message => {
      if (message.operationType === LogbookOperationType.COR) {
        correctedMessagesReferencedIds = correctedMessagesReferencedIds.concat(message.referencedReportId)
      }

      if (!correctedMessagesReferencedIds.includes(message.reportId) && message.acknowledge && message.acknowledge.isSuccess) {
        message.message.hauls.forEach(haul => {
          haul.catches.forEach(speciesCatch => setSpeciesToWeightObject(speciesToWeightObject, speciesCatch, totalWeight))
        })
      }
    })

  return speciesToWeightObject
}

export const getDISSpeciesToWeightObject = (messages, totalWeight) => {
  const speciesToWeightObject = {}
  let correctedMessagesReferencedIds = []

  messages
    .sort(sortByCorrectedMessagesFirst())
    .forEach(message => {
      if (message.operationType === LogbookOperationType.COR) {
        correctedMessagesReferencedIds = correctedMessagesReferencedIds.concat(message.referencedReportId)
      }

      if (!correctedMessagesReferencedIds.includes(message.reportId) && message.acknowledge && message.acknowledge.isSuccess) {
        message.message.catches.forEach(speciesCatch => {
          setSpeciesToWeightObject(speciesToWeightObject, speciesCatch, totalWeight)
        })
      }
    })

  return speciesToWeightObject
}

export const getSpeciesAndPresentationToWeightFARObject = farMessages => {
  const speciesAndPresentationToWeightFARObject = {}
  let correctedMessagesReferencedIds = []

  farMessages
    .sort(sortByCorrectedMessagesFirst())
    .forEach(message => {
      if (message.operationType === LogbookOperationType.COR) {
        correctedMessagesReferencedIds = correctedMessagesReferencedIds.concat(message.referencedReportId)
      }

      if (!correctedMessagesReferencedIds.includes(message.reportId) && message.acknowledge && message.acknowledge.isSuccess) {
        message.message.hauls.forEach(haul => {
          haul.catches.forEach(speciesCatch => {
            getSpeciesAndPresentationToWeightObject(speciesAndPresentationToWeightFARObject, speciesCatch)
          })
        })
      }
    })

  return speciesAndPresentationToWeightFARObject
}

export const getSpeciesToWeightLANObject = lanMessage => {
  const speciesToWeightLANObject = {}

  lanMessage.message.catchLanded.forEach(speciesCatch => {
    setSpeciesToWeightObject(speciesToWeightLANObject, speciesCatch, null, true)
  })

  return speciesToWeightLANObject
}

export const getSpeciesToWeightPNOObject = (pnoMessage, totalFARAndDEPWeight) => {
  const speciesToWeightPNOObject = {}

  pnoMessage.message.catchOnboard.forEach(speciesCatch => {
    setSpeciesToWeightObject(speciesToWeightPNOObject, speciesCatch, totalFARAndDEPWeight)
  })

  return speciesToWeightPNOObject
}

export const getFAOZonesFromFARMessages = farMessages => {
  return farMessages
    .map(farMessage => {
      return farMessage.message.hauls.map(haul => haul.catches.map(speciesCatch => speciesCatch.faoZone)).flat()
    })
    .flat()
    .reduce((acc, faoZone) => {
      if (acc.indexOf(faoZone) < 0) {
        acc.push(faoZone)
      }

      return acc
    }, [])
}

/**
 * Get effective datetime from logbook message
 * @param {LogbookMessage} message
 * @return {string} date - Message effective date
 */
export const getEffectiveDateTimeFromMessage = message => {
  // All FAR catches have at least one haul, so we take the first one to show the catch on track
  const FIRST_HAUL = 0

  switch (message.messageType) {
    case 'DEP':
      return message.message.departureDatetimeUtc
    case 'FAR':
      return message.message.hauls[FIRST_HAUL].farDatetimeUtc
    case 'DIS':
      return message.message.discardDatetimeUtc
    case 'COE':
      return message.message.effortZoneEntryDatetimeUtc
    case 'COX':
      return message.message.effortZoneExitDatetimeUtc
    case 'LAN':
      return message.message.landingDatetimeUtc
    case 'EOF':
      return message.message.endOfFishingDatetimeUtc
    case 'RTP':
      return message.message.returnDatetimeUtc
    case 'PNO':
      return message.reportDateTime < message.message.predictedArrivalDatetimeUtc
        ? message.reportDateTime
        : message.message.predictedArrivalDatetimeUtc
    default:
      return message.reportDateTime
  }
}

export const getFishingActivityFeatureOnTrackLine = (fishingActivity, lineOfFishingActivity, fishingActivityDateTimestamp) => {
  const totalDistance = new Date(lineOfFishingActivity.secondPositionDate).getTime() - new Date(lineOfFishingActivity.firstPositionDate).getTime()
  const fishingActivityDistanceFromFirstPoint = fishingActivityDateTimestamp - new Date(lineOfFishingActivity.firstPositionDate).getTime()
  const distanceFraction = fishingActivityDistanceFromFirstPoint / totalDistance

  const coordinates = lineOfFishingActivity.getGeometry().getCoordinateAt(distanceFraction)
  const feature = new Feature({
    geometry: new Point(coordinates)
  })
  feature.name = fishingActivity.name
  feature.setStyle(getFishingActivityCircleStyle())
  feature.setId(`${LayerProperties.VESSEL_TRACK.code}:logbook:${fishingActivityDateTimestamp}`)

  return {
    feature,
    coordinates,
    id: fishingActivity.id
  }
}

/**
 * Get the logbook message type - used to handle the specific DIM message type case
 * @param {LogbookMessage} message
 * @return {string} messageType - The message type
 */
export const getLogbookMessageType = message => {
  if (message.messageType === LogbookMessageType.DIS.code &&
    message.message.catches.some(aCatch => aCatch.presentation === LogbookMessageType.DIM.code)) {
    return LogbookMessageType.DIM.code
  }
  return LogbookMessageType[message.messageType].displayCode
}
