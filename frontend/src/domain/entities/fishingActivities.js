import { ERSMessageType as ERSMessageTypeEnum } from './ERS'

export const getDEPMessageFromMessages = ersMessages => ersMessages
  .find(message => message.messageType === ERSMessageTypeEnum.DEP.code)

export const getDISMessagesFromMessages = ersMessages => ersMessages
  .filter(message => message.messageType === ERSMessageTypeEnum.DIS.code)

export const getPNOMessageFromMessages = ersMessages => ersMessages
  .find(message => message.messageType === ERSMessageTypeEnum.PNO.code)

export const getFARMessagesFromMessages = ersMessages => ersMessages
  .filter(message => message.messageType === ERSMessageTypeEnum.FAR.code)

export const getLANMessageFromMessages = (ersMessages, depMessage) => {
  return ersMessages
    .filter(message => message.messageType === ERSMessageTypeEnum.LAN.code)
    .find(message => {
      const depTripNumber = depMessage.tripNumber
      if (depTripNumber) {
        return depTripNumber === message.tripNumber
      }

      const landingDatetimeUtc = new Date(message.message.landingDatetimeUtc)
      const departureDatetimeUtc = new Date(depMessage.message.departureDatetimeUtc)
      return landingDatetimeUtc > departureDatetimeUtc
    })
}

export const getTotalFAROrDISWeightFromMessages = ersMessages => {
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

export const getSpeciesToWeightFARObject = (farMessages, totalFARWeight) => {
  const speciesToWeightFARObject = {}

  farMessages.forEach(message => {
    if (message.acknowledge && message.acknowledge.isSuccess) {
      message.message.catches.forEach(speciesCatch => {
        setSpeciesToWeightObject(speciesToWeightFARObject, speciesCatch, totalFARWeight)
      })
    }
  })

  return speciesToWeightFARObject
}

export const getSpeciesAndPresentationToWeightFARObject = farMessages => {
  const speciesAndPresentationToWeightFARObject = {}

  farMessages.forEach(message => {
    if (message.acknowledge && message.acknowledge.isSuccess) {
      message.message.catches.forEach(speciesCatch => {
        getSpeciesAndPresentationToWeightObject(speciesAndPresentationToWeightFARObject, speciesCatch)
      })
    }
  })

  return speciesAndPresentationToWeightFARObject
}

export const getSpeciesToWeightDISObject = (disMessages, totalDISWeight) => {
  const speciesToWeightDISObject = {}

  disMessages.forEach(message => {
    if (message.acknowledge && message.acknowledge.isSuccess) {
      message.message.catches.forEach(speciesCatch => {
        setSpeciesToWeightObject(speciesToWeightDISObject, speciesCatch, totalDISWeight)
      })
    }
  })

  return speciesToWeightDISObject
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
