import { ERSMessageType as ERSMessageTypeEnum } from './ERS'

export const getDEPMessageFromMessages = ersMessages => ersMessages.find(message => message.messageType === ERSMessageTypeEnum.DEP.code)

export const getDISMessagesFromMessages = ersMessages => ersMessages.filter(message => message.messageType === ERSMessageTypeEnum.DIS.code)

export const getPNOMessageFromMessages = ersMessages => ersMessages.find(message => message.messageType === ERSMessageTypeEnum.PNO.code)

export const getFARMessagesFromMessages = ersMessages => ersMessages.filter(message => message.messageType === ERSMessageTypeEnum.FAR.code)

export const getLANMessageFromMessages = (ersMessages, depMessage) => {
  return ersMessages
    .filter(message => message.messageType === ERSMessageTypeEnum.LAN.code)
    .find(message => {
      const depTripNumber = depMessage.tripNumber
      if (depTripNumber) {
        return depTripNumber === message.tripNumber
      } else {
        const landingDatetimeUtc = new Date(message.message.landingDatetimeUtc)
        const departureDatetimeUtc = new Date(depMessage.message.departureDatetimeUtc)
        return landingDatetimeUtc > departureDatetimeUtc
      }
    })
}

export const getTotalFARWeightFromMessages = (ersMessages) => {
  return parseFloat(ersMessages
    .reduce((accumulator, ersMessage) => {
      const sumOfCatches = ersMessage.acknowledge && ersMessage.acknowledge.isSuccess
        ? ersMessage.message.catches.reduce((subAccumulator, speciesCatch) => {
          return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
        }, 0)
        : 0
      return accumulator + sumOfCatches
    }, 0).toFixed(1))
}

export const getTotalDEPWeightFromMessages = ersMessage => {
  return parseFloat(ersMessage.message.speciesOnboard.reduce((subAccumulator, speciesCatch) => {
    return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
  }, 0).toFixed(1))
}

export const getTotalLANWeightFromMessages = ersMessage => {
  return parseFloat(ersMessage.message.catchLanded.reduce((subAccumulator, speciesCatch) => {
    return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
  }, 0).toFixed(1))
}

export const getTotalPNOWeightFromMessages = ersMessage => {
  return parseFloat(ersMessage.message.catchOnboard.reduce((subAccumulator, speciesCatch) => {
    return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
  }, 0).toFixed(1))
}

export const getTotalDISWeightFromMessages = ersMessages => {
  return parseFloat(ersMessages
    .reduce((accumulator, ersMessage) => {
      const sumOfCatches = ersMessage.message.catches.reduce((subAccumulator, speciesCatch) => {
        return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
      }, 0)

      return accumulator + sumOfCatches
    }, 0).toFixed(1))
}

function getSpeciesToWeightObject (speciesToWeightObject, speciesCatch, totalWeight) {
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

export const getSpeciesToWeightFARObject = (farMessages, totalFARWeight) => {
  const speciesToWeightFARObject = {}

  farMessages.forEach(message => {
    message.message.catches.forEach(speciesCatch => {
      getSpeciesToWeightObject(speciesToWeightFARObject, speciesCatch, totalFARWeight)
    })
  })

  return speciesToWeightFARObject
}

export const getSpeciesToWeightDISObject = (disMessages, totalDISWeight) => {
  const speciesToWeightDISObject = {}

  disMessages.forEach(message => {
    message.message.catches.forEach(speciesCatch => {
      getSpeciesToWeightObject(speciesToWeightDISObject, speciesCatch, totalDISWeight)
    })
  })

  return speciesToWeightDISObject
}

export const getSpeciesToWeightLANObject = (lanMessage) => {
  const speciesToWeightLANObject = {}

  lanMessage.message.catchLanded.forEach(speciesCatch => {
    // TODO Regarder le calcul de la somme du LAN pour chaue espèce, ça semble trop élevé en env de DEV
    getSpeciesToWeightObject(speciesToWeightLANObject, speciesCatch, null)
  })

  return speciesToWeightLANObject
}

export const getSpeciesToWeightPNOObject = (pnoMessage, totalFARAndDEPWeight) => {
  const speciesToWeightPNOObject = {}

  pnoMessage.message.catchOnboard.forEach(speciesCatch => {
    getSpeciesToWeightObject(speciesToWeightPNOObject, speciesCatch, totalFARAndDEPWeight)
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