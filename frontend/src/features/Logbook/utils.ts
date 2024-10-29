import { getFishingActivityCircleStyle } from '@features/Vessel/layers/styles/vesselTrack.style'
import { Feature } from 'ol'
import Point from 'ol/geom/Point'

import { LogbookMessageType } from './constants'
import { LayerProperties } from '../../domain/entities/layers/constants'
import { undefinedize } from '../../utils/undefinedize'

import type { CatchProperty, CatchWithProperties, ProtectedCatchWithProperties } from './components/VesselLogbook/types'
import type { LogbookCatch, LogbookMessage } from './LegacyLogbook.types'
import type { Logbook, Logbook as LogbookMessageNamespace } from './Logbook.types'
import type { SpeciesInsight, SpeciesToSpeciesInsight, SpeciesToSpeciesInsightList } from './types'
import type { DeclaredLogbookSpecies, FishingActivityShowedOnMap } from '../../domain/entities/vessel/types'

function getCatchPropertiesObject(logbookCatch: Logbook.Catch): CatchProperty {
  return {
    conversionFactor: undefinedize(logbookCatch.conversionFactor),
    economicZone: undefinedize(logbookCatch.economicZone),
    effortZone: undefinedize(logbookCatch.effortZone),
    faoZone: undefinedize(logbookCatch.faoZone),
    nbFish: undefinedize(logbookCatch.nbFish),
    packaging: undefinedize(logbookCatch.packaging),
    presentation: undefinedize(logbookCatch.presentation),
    preservationState: undefinedize(logbookCatch.preservationState),
    statisticalRectangle: undefinedize(logbookCatch.statisticalRectangle),
    weight: undefinedize(logbookCatch.weight)
  }
}

export function buildCatchArray(catches: Logbook.Catch[]): CatchWithProperties[] {
  const NOT_FOUND = -1

  return catches
    .reduce((accumulator: CatchWithProperties[], logbookCatch) => {
      const sameSpeciesIndex = accumulator.findIndex(accCatch => accCatch.species === logbookCatch.species)
      const logbookCatchProperties = getCatchPropertiesObject(logbookCatch)

      if (sameSpeciesIndex === NOT_FOUND) {
        return accumulator.concat({
          nbFish: logbookCatch.nbFish ? logbookCatch.nbFish : 0,
          properties: [logbookCatchProperties],
          species: logbookCatch.species,
          speciesName: undefinedize(logbookCatch.speciesName),
          weight: logbookCatch.weight ? logbookCatch.weight : 0
        })
      }

      const nextCatch = accumulator[sameSpeciesIndex] as CatchWithProperties
      nextCatch.properties = nextCatch.properties.concat(logbookCatchProperties)
      nextCatch.weight += logbookCatch.weight ?? 0
      nextCatch.nbFish += logbookCatch.nbFish ?? 0

      accumulator[sameSpeciesIndex] = nextCatch

      return accumulator
    }, [])
    .sort((catchA, catchB) => catchB.weight - catchA.weight)
}

export function buildProtectedCatchArray(catches: Logbook.ProtectedSpeciesCatch[]): ProtectedCatchWithProperties[] {
  const NOT_FOUND = -1

  return catches
    .reduce((accumulator: ProtectedCatchWithProperties[], logbookCatch) => {
      const sameSpeciesIndex = accumulator.findIndex(accCatch => accCatch.species === logbookCatch.species)

      if (sameSpeciesIndex === NOT_FOUND) {
        return accumulator.concat({
          nbFish: logbookCatch.nbFish ? logbookCatch.nbFish : 0,
          properties: [logbookCatch],
          species: logbookCatch.species,
          speciesName: undefinedize(logbookCatch.speciesName),
          weight: logbookCatch.weight ? logbookCatch.weight : 0
        })
      }

      const nextCatch = accumulator[sameSpeciesIndex] as ProtectedCatchWithProperties
      nextCatch.properties = nextCatch.properties.concat(logbookCatch)
      nextCatch.weight += logbookCatch.weight ?? 0
      nextCatch.nbFish += logbookCatch.nbFish ?? 0

      accumulator[sameSpeciesIndex] = nextCatch

      return accumulator
    }, [])
    .sort((catchA, catchB) => catchB.weight - catchA.weight)
}

export const getDEPMessage = (logbookMessages: LogbookMessage[]): LogbookMessage | undefined =>
  logbookMessages.find(message => message.messageType === LogbookMessageType.DEP.code)

export const getDISMessages = (logbookMessages: LogbookMessage[]): LogbookMessage[] =>
  logbookMessages.filter(message => message.messageType === LogbookMessageType.DIS.code)

export const getCPSMessages = (logbookMessages: LogbookMessage[]): LogbookMessage[] =>
  logbookMessages.filter(message => message.messageType === LogbookMessageType.CPS.code)

/**
 * Get the first valid PNO if found or return the first PNO
 */
export const getPNOMessage = (logbookMessages: LogbookMessage[]): LogbookMessage | undefined => {
  const validPNOs = logbookMessages.filter(
    message =>
      message.messageType === LogbookMessageType.PNO.code && !message.isCorrectedByNewerMessage && !message.isDeleted
  )

  if (validPNOs.length === 1) {
    return validPNOs[0]
  }

  return logbookMessages.find(message => message.messageType === LogbookMessageType.PNO.code)
}

export const getFARMessages = (logbookMessages: LogbookMessage[]): LogbookMessage[] =>
  logbookMessages.filter(message => message.messageType === LogbookMessageType.FAR.code)

/**
 * Get the first valid LAN if found or return the first LAN
 */
export const getLANMessage = (logbookMessages: LogbookMessage[]): LogbookMessage | undefined => {
  const validLANs = logbookMessages.filter(
    message =>
      message.messageType === LogbookMessageType.LAN.code && !message.isCorrectedByNewerMessage && !message.isDeleted
  )

  if (validLANs.length === 1) {
    return validLANs[0]
  }

  return logbookMessages.find(message => message.messageType === LogbookMessageType.LAN.code)
}

/**
 * Notes :
 * - The DIS message weight are LIVE, so we must NOT apply the conversion factor
 * - Only uncorrected and undeleted messages are taken
 */
export const getTotalDISWeight = (logbookMessages: LogbookMessage[]): number => {
  const weight = logbookMessages
    .filter(message => !message.isCorrectedByNewerMessage && !message.isDeleted && !!message.acknowledgment?.isSuccess)
    .reduce((accumulator, logbookMessage) => {
      const sumOfCatches = getSumOfCatches(logbookMessage.message.catches, false)

      return accumulator + sumOfCatches
    }, 0)
    .toFixed(1)

  return parseFloat(weight)
}

/**
 * Notes :
 * - Only uncorrected and undeleted messages are taken
 */
export const getCPSDistinctSpecies = (logbookMessages: LogbookMessage[]): number => {
  const species: string[] = logbookMessages
    .filter(message => !message.isCorrectedByNewerMessage && !message.isDeleted && !!message.acknowledgment?.isSuccess)
    .reduce(
      (accumulator: string[], logbookMessage) =>
        accumulator.concat(logbookMessage.message.catches.map(specyCatch => specyCatch.species)),
      []
    )

  return Array.from(new Set(species)).length
}

export const areAllMessagesNotAcknowledged = (logbookMessages: LogbookMessage[]) =>
  logbookMessages.length === logbookMessages.filter(logbookMessage => !logbookMessage?.acknowledgment?.isSuccess).length

/**
 * Notes :
 * - The FAR message weight are LIVE, so we must NOT apply the conversion factor
 * - Only uncorrected and undeleted messages are taken
 * - A FAR message contain an array of `Haul` which then contains an array of `Catch`
 */
export const getTotalFARWeight = (logbookMessages: LogbookMessage[]): number => {
  if (!logbookMessages.length) {
    return 0
  }

  const weight = logbookMessages
    .filter(message => !message.isCorrectedByNewerMessage && !message.isDeleted && !!message.acknowledgment?.isSuccess)
    .reduce((accumulator, logbookMessage) => {
      const sumOfCatches = logbookMessage.message.hauls.reduce(
        (subAccumulator, haul) => subAccumulator + getSumOfCatches(haul.catches, false),
        0
      )

      return accumulator + sumOfCatches
    }, 0)
    .toFixed(1)

  return parseFloat(weight)
}

/**
 * The DEP message weight are LIVE, so we must NOT apply the conversion factor
 */
export const getTotalDEPWeight = (logbookMessage: LogbookMessage | undefined): number =>
  logbookMessage ? getSumOfCatches(logbookMessage.message.speciesOnboard, false) : 0

/**
 * The LAN message weight are NET, so we must apply the conversion factor to get LIVE weights
 */
export const getTotalLANWeight = (logbookMessage: LogbookMessage | undefined): number =>
  logbookMessage ? getSumOfCatches(logbookMessage.message.catchLanded, true) : 0

/**
 * The PNO message weight are LIVE, so we must NOT apply the conversion factor
 */
export const getTotalPNOWeight = (logbookMessageValue: Logbook.PnoMessageValue | undefined): number =>
  logbookMessageValue ? getSumOfCatches(logbookMessageValue?.catchOnboard ?? [], false) : 0

function getSumOfCatches(arrayOfCatches: Logbook.Catch[], hasConversionFactorApplied = false): number {
  const sum = arrayOfCatches.reduce((subAccumulator, speciesCatch) => {
    const conversionFactor =
      hasConversionFactorApplied && speciesCatch.conversionFactor ? speciesCatch.conversionFactor : 1
    const weight = speciesCatch.weight ?? 0

    return subAccumulator + (weight * conversionFactor || 0)
  }, 0)

  return parseFloat(sum.toFixed(1))
}

function setSpeciesToWeightObject(
  speciesToWeightObject: SpeciesToSpeciesInsight,
  speciesCatch,
  totalWeight: number | undefined,
  hasConversionFactorApplied: boolean
) {
  const conversionFactor =
    hasConversionFactorApplied && speciesCatch.conversionFactor ? speciesCatch.conversionFactor : 1
  const existingSpeciesInsight = speciesToWeightObject[speciesCatch.species]
  const nextWeight = multiplyByConversionFactorIfNeeded(speciesCatch.weight, conversionFactor)

  if (!existingSpeciesInsight) {
    // eslint-disable-next-line no-param-reassign
    speciesToWeightObject[speciesCatch.species] = {
      species: speciesCatch.species,
      speciesName: speciesCatch.speciesName,
      totalWeight,
      weight: nextWeight
    }

    return
  }

  const nextSummedWeight = existingSpeciesInsight.weight + nextWeight
  // @ts-ignore
  // eslint-disable-next-line no-param-reassign
  speciesToWeightObject[speciesCatch.species].weight = parseFloat(nextSummedWeight.toFixed(1))
}

function multiplyByConversionFactorIfNeeded(weight, conversionFactor = 1) {
  if (!weight) {
    return 0
  }

  const weightWithConversionFactor = weight * conversionFactor

  return parseFloat(weightWithConversionFactor.toFixed(1))
}

function getSpeciesInsight(speciesCatch): SpeciesInsight {
  return {
    presentation: speciesCatch.presentation,
    species: speciesCatch.species,
    speciesName: speciesCatch.speciesName,
    weight: speciesCatch.weight ? parseFloat(speciesCatch.weight.toFixed(1)) : 0
  }
}

/**
 * /!\ This function is not pure and works with side-effect: it modifies the speciesToWeightObject parameter
 *     and hences has no return value.
 */
function getSpeciesAndPresentationToWeightObject(
  speciesToWeightObject: SpeciesToSpeciesInsightList,
  speciesCatch: LogbookCatch
) {
  if (!speciesCatch.species) {
    return
  }

  const specyWeights = speciesToWeightObject[speciesCatch.species]

  if (!!specyWeights && specyWeights.length > 0) {
    if (specyWeights.find(species => species.presentation === speciesCatch.presentation)) {
      // eslint-disable-next-line no-param-reassign
      speciesToWeightObject[speciesCatch.species] =
        specyWeights.map(speciesAndPresentation => {
          if (speciesAndPresentation.presentation === speciesCatch.presentation) {
            // eslint-disable-next-line no-param-reassign
            speciesAndPresentation.weight = parseFloat(
              (speciesAndPresentation.weight + (speciesCatch.weight ?? 0)).toFixed(1)
            )
          }

          return speciesAndPresentation
        }) || []

      return
    }

    // eslint-disable-next-line no-param-reassign
    // @ts-ignore
    speciesToWeightObject[speciesCatch.species].push(getSpeciesInsight(speciesCatch))

    return
  }

  // eslint-disable-next-line no-param-reassign
  speciesToWeightObject[speciesCatch.species] = [getSpeciesInsight(speciesCatch)]
}

export const getFARSpeciesInsightRecord = (
  messages: LogbookMessage[],
  totalWeight: number
): SpeciesToSpeciesInsight | undefined => {
  const speciesToWeightObject: SpeciesToSpeciesInsight = {}

  messages
    .filter(message => !message.isCorrectedByNewerMessage && !message.isDeleted && !!message.acknowledgment?.isSuccess)
    .forEach(message => {
      message.message.hauls.forEach(haul => {
        haul.catches.forEach(speciesCatch =>
          setSpeciesToWeightObject(speciesToWeightObject, speciesCatch, totalWeight, false)
        )
      })
    })

  return speciesToWeightObject
}

export const getDISSpeciesInsightRecord = (
  messages: LogbookMessage[],
  totalWeight: number
): SpeciesToSpeciesInsight | undefined => {
  const speciesToWeightObject: SpeciesToSpeciesInsight = {}

  messages
    .filter(message => !message.isCorrectedByNewerMessage && !message.isDeleted && !!message.acknowledgment?.isSuccess)
    .forEach(message => {
      message.message.catches.forEach(speciesCatch => {
        setSpeciesToWeightObject(speciesToWeightObject, speciesCatch, totalWeight, false)
      })
    })

  return speciesToWeightObject
}

export const getFARSpeciesInsightListRecord = (
  farMessages: LogbookMessage[]
): SpeciesToSpeciesInsightList | undefined => {
  if (!farMessages.length) {
    return undefined
  }

  const speciesAndPresentationToWeightFARObject = {}

  farMessages
    .filter(message => !message.isCorrectedByNewerMessage && !message.isDeleted && !!message.acknowledgment?.isSuccess)
    .forEach(message => {
      message.message.hauls.forEach(haul => {
        haul.catches.forEach(speciesCatch => {
          getSpeciesAndPresentationToWeightObject(speciesAndPresentationToWeightFARObject, speciesCatch)
        })
      })
    })

  return speciesAndPresentationToWeightFARObject
}

export const getLANSpeciesInsightRecord = (
  lanMessage: LogbookMessage | undefined
): SpeciesToSpeciesInsight | undefined => {
  if (!lanMessage) {
    return undefined
  }

  const speciesToWeightLANObject = {}

  lanMessage.message.catchLanded.forEach(speciesCatch => {
    setSpeciesToWeightObject(speciesToWeightLANObject, speciesCatch, undefined, true)
  })

  return speciesToWeightLANObject
}

export const getPNOSpeciesInsightRecord = (
  pnoMessage: LogbookMessage | undefined,
  totalFARAndDEPWeight
): SpeciesToSpeciesInsight | undefined => {
  if (!pnoMessage) {
    return undefined
  }

  const speciesToWeightPNOObject = {}

  pnoMessage.message.catchOnboard.forEach(speciesCatch => {
    setSpeciesToWeightObject(speciesToWeightPNOObject, speciesCatch, totalFARAndDEPWeight, false)
  })

  return speciesToWeightPNOObject
}

export const getFAOZonesFromFARMessages = (farMessages: LogbookMessage[]) =>
  farMessages
    .map(farMessage =>
      farMessage.message.hauls.map(haul => haul.catches.map(speciesCatch => speciesCatch.faoZone)).flat()
    )
    .flat()
    .reduce((acc, faoZone) => {
      if (acc.indexOf(faoZone) < 0) {
        acc.push(faoZone)
      }

      return acc
    }, [])

/**
 * Get the effective datetime from logbook message
 */
export const getEffectiveDateTimeFromMessage = (message: LogbookMessage): string => {
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

export const getFishingActivityFeatureOnTrackLine = (
  fishingActivity: FishingActivityShowedOnMap,
  lineOfFishingActivity: any,
  fishingActivityDateTimestamp: number
) => {
  const totalDistance =
    new Date(lineOfFishingActivity.secondPositionDate).getTime() -
    new Date(lineOfFishingActivity.firstPositionDate).getTime()
  const fishingActivityDistanceFromFirstPoint =
    fishingActivityDateTimestamp - new Date(lineOfFishingActivity.firstPositionDate).getTime()
  const distanceFraction = fishingActivityDistanceFromFirstPoint / totalDistance

  const coordinates = lineOfFishingActivity.getGeometry().getCoordinateAt(distanceFraction)
  const feature = new Feature({
    geometry: new Point(coordinates)
  })
  // @ts-ignore
  feature.name = fishingActivity.name
  feature.setStyle(getFishingActivityCircleStyle())
  feature.setId(`${LayerProperties.VESSEL_TRACK.code}:logbook:${fishingActivityDateTimestamp}`)

  return {
    coordinates,
    feature,
    id: fishingActivity.id
  }
}

/**
 * Get the logbook message type - used to handle the specific DIM message type case
 */
export const getLogbookMessageType = (message: LogbookMessage | LogbookMessageNamespace.Message): string => {
  if (
    message.messageType === LogbookMessageType.DIS.code &&
    message.message.catches.some(aCatch => aCatch.presentation === LogbookMessageType.DIM.code)
  ) {
    return LogbookMessageType.DIM.code
  }

  return LogbookMessageType[message.messageType].displayCode
}

const NOT_FOUND = -1

export function getSummedSpeciesOnBoard(speciesOnBoard: DeclaredLogbookSpecies[]) {
  return speciesOnBoard.reduce((accumulator: DeclaredLogbookSpecies[], specy: DeclaredLogbookSpecies) => {
    const previousSpecyIndex = accumulator.findIndex(existingSpecy => existingSpecy.species === specy.species)

    if (previousSpecyIndex !== NOT_FOUND && accumulator[previousSpecyIndex]) {
      const nextSpecy = { ...accumulator[previousSpecyIndex] }
      // @ts-ignore
      nextSpecy.weight = (nextSpecy.weight ?? 0) + specy.weight
      accumulator[previousSpecyIndex] = nextSpecy as DeclaredLogbookSpecies

      return accumulator
    }

    return accumulator.concat(specy)
  }, [])
}
