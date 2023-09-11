import _ from 'lodash'

import {
  BeaconMalfunctionPropertyName,
  BeaconMalfunctionVesselStatus,
  END_OF_MALFUNCTION_REASON_RECORD,
  STAGE_RECORD
} from './constants'
import { getReducedTimeAgo } from '../../../features/SideWindow/BeaconMalfunctionBoard/beaconMalfunctions'
import { getDate } from '../../../utils'

import type { BeaconMalfunction, BeaconMalfunctionResumeAndDetails } from './types'

/**
 * Get beacon malfunctions for each years : Years are keys and beacon malfunctions are values
 *
 * @returns {Object.<string, BeaconMalfunctionResumeAndDetails[]>} The beacon malfunctions for all years
 */
function getYearsToBeaconMalfunctions(
  beaconMalfunctionsFromDate: Date,
  beaconMalfunctions: BeaconMalfunctionResumeAndDetails[]
): Record<string, BeaconMalfunctionResumeAndDetails[]> {
  const nextYearsToBeaconMalfunctions = initYearToCurrentYearRecord(beaconMalfunctionsFromDate)

  beaconMalfunctions.forEach(beaconMalfunction => {
    if (beaconMalfunction.beaconMalfunction?.malfunctionStartDateTime) {
      const year = new Date(beaconMalfunction.beaconMalfunction?.malfunctionStartDateTime).getUTCFullYear()

      nextYearsToBeaconMalfunctions[year] = nextYearsToBeaconMalfunctions[year]?.concat(beaconMalfunction) || [
        beaconMalfunction
      ]
    }
  })

  return nextYearsToBeaconMalfunctions
}

function initYearToCurrentYearRecord(
  beaconMalfunctionsFromDate: Date
): Record<number, BeaconMalfunctionResumeAndDetails[]> {
  if (!beaconMalfunctionsFromDate) {
    return []
  }

  const nextYearsToBeaconMalfunctions = {}
  let fromYear = beaconMalfunctionsFromDate.getUTCFullYear() + 1
  while (fromYear < new Date().getUTCFullYear()) {
    nextYearsToBeaconMalfunctions[fromYear] = []
    fromYear += 1
  }

  return nextYearsToBeaconMalfunctions
}

/**
 * Get the number of sea and port beacon malfunctions for a given list of beacon malfunctions
 */
function getNumberOfSeaAndLandBeaconMalfunctions(beaconMalfunctions: BeaconMalfunctionResumeAndDetails[]):
  | {
      atPort: number
      atSea: number
    }
  | undefined {
  if (!beaconMalfunctions.length) {
    return undefined
  }

  const numberOfBeaconMalfunctionsAtSea = getNumberOfBeaconMalfunctionsAt(
    BeaconMalfunctionVesselStatus.AT_SEA,
    beaconMalfunctions
  )
  const numberOfBeaconMalfunctionsAtPort = getNumberOfBeaconMalfunctionsAt(
    BeaconMalfunctionVesselStatus.AT_PORT,
    beaconMalfunctions
  )

  return {
    atPort: numberOfBeaconMalfunctionsAtPort,
    atSea: numberOfBeaconMalfunctionsAtSea
  }
}

/**
 * Get the number of beacon malfunctions at Port or at Sea
 */
function getNumberOfBeaconMalfunctionsAt(
  vesselStatus: string,
  beaconMalfunctionsWithDetails: BeaconMalfunctionResumeAndDetails[]
): number {
  return beaconMalfunctionsWithDetails.filter(
    beaconMalfunctionWithDetails => getFirstVesselStatus(beaconMalfunctionWithDetails) === vesselStatus
  ).length
}

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

const getMalfunctionStartDateText = (beaconMalfunction: BeaconMalfunction) => {
  if (
    beaconMalfunction.stage === STAGE_RECORD.END_OF_MALFUNCTION.code ||
    beaconMalfunction.stage === STAGE_RECORD.ARCHIVED.code
  ) {
    switch (beaconMalfunction.endOfBeaconMalfunctionReason) {
      case END_OF_MALFUNCTION_REASON_RECORD.RESUMED_TRANSMISSION.value:
        return `Reprise des émissions ${
          (beaconMalfunction.malfunctionEndDateTime && getReducedTimeAgo(beaconMalfunction.malfunctionEndDateTime)) ||
          ''
        }`
      case END_OF_MALFUNCTION_REASON_RECORD.BEACON_DEACTIVATED_OR_UNEQUIPPED.value:
        return `Balise désactivée ${
          (beaconMalfunction.malfunctionEndDateTime && getReducedTimeAgo(beaconMalfunction.malfunctionEndDateTime)) ||
          ''
        }`
      default:
        throw Error('Should not happen')
    }
  }

  return `Dernière émission le ${getDate(beaconMalfunction.malfunctionStartDateTime)}`
}

export {
  getYearsToBeaconMalfunctions,
  getNumberOfSeaAndLandBeaconMalfunctions,
  getFirstVesselStatus,
  getMalfunctionStartDateText
}
