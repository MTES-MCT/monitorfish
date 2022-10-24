import _ from 'lodash'

import { getReducedTimeAgo } from '../../../features/side_window/beacon_malfunctions/beaconMalfunctions'
import { getDate } from '../../../utils'
import {
  BeaconMalfunctionPropertyName,
  beaconMalfunctionsStageColumnRecord,
  BeaconMalfunctionVesselStatus,
  endOfBeaconMalfunctionReasons
} from './constants'

import type { BeaconMalfunctionResumeAndDetails } from '../../types/beaconMalfunction'

/**
 * Get beacon malfunctions for each years : Years are keys and beacon malfunctions are values
 * @param {Date} beaconMalfunctionsFromDate - The date
 * @param {BeaconMalfunctionResumeAndDetails[]} beaconMalfunctions
 * @returns {Object.<string, BeaconMalfunctionResumeAndDetails[]>} The beacon malfunctions for all years
 */
const getYearsToBeaconMalfunctions = (beaconMalfunctionsFromDate, beaconMalfunctions) => {
  const nextYearsToBeaconMalfunctions = {}
  if (beaconMalfunctionsFromDate) {
    initYears(beaconMalfunctionsFromDate, nextYearsToBeaconMalfunctions)
  }

  beaconMalfunctions.forEach(beaconMalfunction => {
    if (beaconMalfunction.beaconMalfunction?.malfunctionStartDateTime) {
      const year = new Date(beaconMalfunction.beaconMalfunction?.malfunctionStartDateTime).getUTCFullYear()

      if (nextYearsToBeaconMalfunctions[year]?.length) {
        nextYearsToBeaconMalfunctions[year] = nextYearsToBeaconMalfunctions[year].concat(beaconMalfunction)
      } else {
        nextYearsToBeaconMalfunctions[year] = [beaconMalfunction]
      }
    }
  })

  return nextYearsToBeaconMalfunctions
}

function initYears(beaconMalfunctionsFromDate, yearsToBeaconMalfunctions) {
  const nextYearsToBeaconMalfunctions = { ...yearsToBeaconMalfunctions }

  let fromYear = beaconMalfunctionsFromDate.getUTCFullYear() + 1
  while (fromYear < new Date().getUTCFullYear()) {
    nextYearsToBeaconMalfunctions[fromYear] = []
    fromYear += 1
  }
}

/**
 * Get the number of sea and port beacon malfunctions for a given list of beacon malfunctions
 * @param {BeaconMalfunctionResumeAndDetails[]} beaconMalfunctions
 * @returns {{
 *  numberOfBeaconMalfunctionsAtSea: number,
 *  numberOfBeaconMalfunctionsAtPort: number
 * }} The sum of beacon malfunctions at sea and port
 */
const getNumberOfSeaAndLandBeaconMalfunctions = beaconMalfunctions => {
  const numberOfBeaconMalfunctionsAtSea = getNumberOfBeaconMalfunctionsAt(
    BeaconMalfunctionVesselStatus.AT_SEA,
    beaconMalfunctions
  )
  const numberOfBeaconMalfunctionsAtPort = getNumberOfBeaconMalfunctionsAt(
    BeaconMalfunctionVesselStatus.AT_PORT,
    beaconMalfunctions
  )

  return {
    numberOfBeaconMalfunctionsAtPort,
    numberOfBeaconMalfunctionsAtSea
  }
}

/**
 * Get the number of beacon malfunctions at Port or at Sea
 * @param {string<BeaconMalfunctionVesselStatus>} vesselStatus - The vessel status : at Sea or at Port
 * @param {BeaconMalfunctionResumeAndDetails[]} beaconMalfunctionsWithDetails
 * @returns {number} The sum of beacon malfunctions at sea and port
 */
const getNumberOfBeaconMalfunctionsAt = (vesselStatus, beaconMalfunctionsWithDetails) =>
  beaconMalfunctionsWithDetails.filter(
    beaconMalfunctionWithDetails => getFirstVesselStatus(beaconMalfunctionWithDetails) === vesselStatus
  ).length

/**
 * Get the first vessel status of a beacon malfunction
 */
const getFirstVesselStatus = (beaconMalfunctionWithDetails: BeaconMalfunctionResumeAndDetails): string => {
  const beaconMalfunctionsVesselStatusActions = beaconMalfunctionWithDetails.actions.filter(
    action => action.propertyName === BeaconMalfunctionPropertyName.VESSEL_STATUS
  )

  switch (beaconMalfunctionsVesselStatusActions?.length === 0) {
    case true:
      return beaconMalfunctionWithDetails?.beaconMalfunction?.vesselStatus
    case false:
      return _.minBy(beaconMalfunctionsVesselStatusActions, action => action.dateTime)!.previousValue
    default:
      throw Error('Should not happen')
  }
}

const getMalfunctionStartDateText = (vesselStatus, beaconMalfunction) => {
  if (
    beaconMalfunction?.stage === beaconMalfunctionsStageColumnRecord.END_OF_MALFUNCTION.code ||
    beaconMalfunction?.stage === beaconMalfunctionsStageColumnRecord.ARCHIVED.code
  ) {
    switch (beaconMalfunction?.endOfBeaconMalfunctionReason) {
      case endOfBeaconMalfunctionReasons.RESUMED_TRANSMISSION.value:
        return `Reprise des émissions ${getReducedTimeAgo(beaconMalfunction?.malfunctionStartDateTime)}`
      case endOfBeaconMalfunctionReasons.PERMANENT_INTERRUPTION_OF_SUPERVISION.value:
        return `Balise désactivée ${getReducedTimeAgo(beaconMalfunction?.malfunctionStartDateTime)}`
      case endOfBeaconMalfunctionReasons.TEMPORARY_INTERRUPTION_OF_SUPERVISION.value:
        return `Balise désactivée ${getReducedTimeAgo(beaconMalfunction?.malfunctionStartDateTime)}`
      default:
        throw Error('Should not happen')
    }
  }

  return vesselStatus?.value === BeaconMalfunctionVesselStatus.NEVER_EMITTED
    ? `Balise activée le ${getDate(beaconMalfunction?.malfunctionStartDateTime)}`
    : `Dernière émission ${getReducedTimeAgo(beaconMalfunction?.malfunctionStartDateTime)}`
}

export {
  getYearsToBeaconMalfunctions,
  getNumberOfSeaAndLandBeaconMalfunctions,
  getFirstVesselStatus,
  getMalfunctionStartDateText
}
