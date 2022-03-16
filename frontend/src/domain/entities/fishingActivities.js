import { ERSMessageType as ERSMessageTypeEnum, ERSOperationType } from './ERS'
import { Feature } from 'ol'
import Point from 'ol/geom/Point'
import { getFishingActivityCircleStyle } from '../../layers/styles/vesselTrack.style'
import Layers from './layers'

export const getDEPMessageFromMessages = ersMessages => ersMessages
  .find(message => message.messageType === ERSMessageTypeEnum.DEP.code)

export const getDISMessagesFromMessages = ersMessages => ersMessages
  .filter(message => message.messageType === ERSMessageTypeEnum.DIS.code)

export const getPNOMessageFromMessages = ersMessages => [...ersMessages]
  .sort(sortByCorrectedMessagesFirst())
  .find(message => message.messageType === ERSMessageTypeEnum.PNO.code)

export const getFARMessagesFromMessages = ersMessages => ersMessages
  .filter(message => message.messageType === ERSMessageTypeEnum.FAR.code)

export const getLANMessageFromMessages = ersMessages => [...ersMessages]
  .sort(sortByCorrectedMessagesFirst())
  .find(message => message.messageType === ERSMessageTypeEnum.LAN.code)

function sortByCorrectedMessagesFirst () {
  return (x, y) => {
    if (x.operationType === ERSOperationType.COR) {
      return -1
    }

    if (y.operationType === ERSOperationType.COR) {
      return 1
    }

    return 0
  }
}

export const getTotalFAROrDISWeightFromMessages = ersMessages => {
  let correctedMessagesReferencedIds = []

  return parseFloat(ersMessages
    .sort(sortByCorrectedMessagesFirst())
    .reduce((accumulator, ersMessage) => {
      if (ersMessage.operationType === ERSOperationType.COR) {
        correctedMessagesReferencedIds = correctedMessagesReferencedIds.concat(ersMessage.referencedErsId)
      }

      const sumOfCatches = !correctedMessagesReferencedIds.includes(ersMessage.ersId) && ersMessage.acknowledge && ersMessage.acknowledge.isSuccess
        ? ersMessage.message.catches.reduce((subAccumulator, speciesCatch) => {
          return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
        }, 0)
        : 0
      return accumulator + sumOfCatches
    }, 0).toFixed(1))
}

export const getTotalDEPWeightFromMessage = ersMessage => {
  return parseFloat(ersMessage.message.speciesOnboard.reduce((subAccumulator, speciesCatch) => {
    return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
  }, 0).toFixed(1))
}

export const getTotalLANWeightFromMessage = ersMessage => {
  return parseFloat(ersMessage.message.catchLanded.reduce((subAccumulator, speciesCatch) => {
    return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
  }, 0).toFixed(1))
}

export const getTotalPNOWeightFromMessage = ersMessage => {
  return parseFloat(ersMessage.message.catchOnboard.reduce((subAccumulator, speciesCatch) => {
    return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
  }, 0).toFixed(1))
}

function setSpeciesToWeightObject (speciesToWeightObject, speciesCatch, totalWeight) {
  if (speciesToWeightObject[speciesCatch.species]) {
    speciesToWeightObject[speciesCatch.species].weight = parseFloat((
      speciesToWeightObject[speciesCatch.species].weight +
      (speciesCatch.weight ? parseFloat(speciesCatch.weight) : 0)).toFixed(1))
  } else {
    speciesToWeightObject[speciesCatch.species] = {
      species: speciesCatch.species,
      weight: speciesCatch.weight ? parseFloat(speciesCatch.weight.toFixed(1)) : 0,
      speciesName: speciesCatch.speciesName,
      totalWeight: totalWeight
    }
  }
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

export const getFAROrDISSpeciesToWeightObject = (messages, totalWeight) => {
  const speciesToWeightObject = {}
  let correctedMessagesReferencedIds = []

  messages
    .sort(sortByCorrectedMessagesFirst())
    .forEach(message => {
      if (message.operationType === ERSOperationType.COR) {
        correctedMessagesReferencedIds = correctedMessagesReferencedIds.concat(message.referencedErsId)
      }

      if (!correctedMessagesReferencedIds.includes(message.ersId) && message.acknowledge && message.acknowledge.isSuccess) {
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
      if (message.operationType === ERSOperationType.COR) {
        correctedMessagesReferencedIds = correctedMessagesReferencedIds.concat(message.referencedErsId)
      }

      if (!correctedMessagesReferencedIds.includes(message.ersId) && message.acknowledge && message.acknowledge.isSuccess) {
        message.message.catches.forEach(speciesCatch => {
          getSpeciesAndPresentationToWeightObject(speciesAndPresentationToWeightFARObject, speciesCatch)
        })
      }
    })

  return speciesAndPresentationToWeightFARObject
}

export const getSpeciesToWeightLANObject = lanMessage => {
  const speciesToWeightLANObject = {}

  lanMessage.message.catchLanded.forEach(speciesCatch => {
    // TODO Regarder le calcul de la somme du LAN pour chaue espèce, ça semble trop élevé en env de DEV
    setSpeciesToWeightObject(speciesToWeightLANObject, speciesCatch, null)
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
      return farMessage.message.catches.map(speciesCatch => speciesCatch.faoZone)
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
 * Get effective datetime from ERS message
 * @param {ERSMessage} message
 * @return {string} date - Message effective date
 */
export const getEffectiveDateTimeFromMessage = message => {
  switch (message.messageType) {
    case 'DEP': return message.message.departureDatetimeUtc
    case 'FAR': return message.message.farDatetimeUtc
    case 'DIS': return message.message.discardDatetimeUtc
    case 'COE': return message.message.effortZoneEntryDatetimeUtc
    case 'COX': return message.message.effortZoneExitDatetimeUtc
    case 'LAN': return message.message.landingDatetimeUtc
    case 'EOF': return message.message.endOfFishingDatetimeUtc
    case 'RTP': return message.message.returnDatetimeUtc
    case 'PNO': return message.operationDateTime < message.message.predictedArrivalDatetimeUtc
      ? message.operationDateTime
      : message.message.predictedArrivalDatetimeUtc
    default: return message.operationDateTime
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
  feature.setId(`${Layers.VESSEL_TRACK.code}:ers:${fishingActivityDateTimestamp}`)

  return {
    feature,
    coordinates,
    id: fishingActivity.id
  }
}

/**
 * Get the ERS message type - used to handle the specific DIM message type case
 * @param {ERSMessage} message
 * @return {string} messageType - The message type
 */
export const getErsMessageType = message => {
  if (message.messageType === ERSMessageTypeEnum.DIS.code &&
    message.message.catches.some(aCatch => aCatch.presentation === ERSMessageTypeEnum.DIM.code)) {
    return ERSMessageTypeEnum.DIM.code
  }
  return message.messageType
}
