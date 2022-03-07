import _ from 'lodash'
import styled from 'styled-components'
import { ReactComponent as VesselStatusNoNewsSVG } from '../../features/icons/Avarie_statut_sans_nouvelles.svg'
import { ReactComponent as VesselStatusAtPortSVG } from '../../features/icons/Avarie_statut_navire_a_quai.svg'
import { COLORS } from '../../constants/constants'
import React from 'react'
import { ReactComponent as VesselStatusTechnicalStopSVG } from '../../features/icons/Avarie_statut_arret_tech.svg'
import { ReactComponent as VesselStatusAtSeaSVG } from '../../features/icons/Avarie_statut_navire_en_mer.svg'
import { ReactComponent as VesselStatusActivityDetectedSVG } from '../../features/icons/Avarie_statut_activite_detectee.svg'

/* eslint-disable */
/** @namespace BeaconMalfunction */
const BeaconMalfunction = null
/* eslint-disable */

const BeaconMalfunctionsTab = {
  RESUME: 1,
  DETAIL: 2
}

const UserType = {
  OPS: 'OPS',
  SIP: 'SIP'
}

const BeaconMalfunctionPropertyName = {
  VESSEL_STATUS: 'VESSEL_STATUS',
  STAGE: 'STAGE'
}

const BeaconMalfunctionVesselStatus = {
  AT_PORT: 'AT_PORT',
  AT_SEA: 'AT_SEA',
  NO_NEWS: 'NO_NEWS',
  TECHNICAL_STOP: 'TECHNICAL_STOP',
  ACTIVITY_DETECTED: 'ACTIVITY_DETECTED'
}

const VesselStatusAtPort = styled(VesselStatusAtPortSVG)``
const VesselStatusAtSea = styled(VesselStatusAtSeaSVG)``
const VesselStatusNoNews = styled(VesselStatusNoNewsSVG)``
const VesselStatusTechnicalStop = styled(VesselStatusTechnicalStopSVG)``
const VesselStatusActivityDetected = styled(VesselStatusActivityDetectedSVG)``

const iconStyle = {
  verticalAlign: 'sub',
  height: 17
}

const vesselStatuses = [
  {
    label: 'Navire à quai',
    value: 'AT_PORT',
    color: '#F4DEAF',
    textColor: COLORS.charcoal,
    icon: <VesselStatusAtPort style={iconStyle}/>
  },
  {
    label: 'Navire en mer',
    value: 'AT_SEA',
    color: '#9ED7D9',
    textColor: COLORS.charcoal,
    icon: <VesselStatusAtSea style={iconStyle}/>
  },
  {
    label: 'Sans nouvelles',
    value: 'NO_NEWS',
    color: '#F7BA9E',
    textColor: COLORS.charcoal,
    icon: <VesselStatusNoNews style={iconStyle}/>
  },
  {
    label: 'En arrêt technique',
    value: 'TECHNICAL_STOP',
    color: '#E8CA46',
    textColor: COLORS.charcoal,
    icon: <VesselStatusTechnicalStop style={iconStyle}/>
  },
  {
    label: 'Activité détectée',
    value: 'ACTIVITY_DETECTED',
    color: '#C41812',
    textColor: COLORS.white,
    icon: <VesselStatusActivityDetected style={iconStyle}/>
  }
]

/**
 * Get beacon malfunctions for each years : Years are keys and beacon malfunctions are values
 * @memberOf BeaconMalfunction
 * @param {Date} beaconMalfunctionsFromDate - The date
 * @param {BeaconStatusWithDetails[]} beaconMalfunctions
 * @returns {Object.<string, BeaconStatusWithDetails[]>} The beacon malfunctions for all years
 */
const getYearsToBeaconMalfunctions = (beaconMalfunctionsFromDate, beaconMalfunctions) => {
  const nextYearsToBeaconMalfunctions = {}
  if (beaconMalfunctionsFromDate) {
    initYears(beaconMalfunctionsFromDate, nextYearsToBeaconMalfunctions)
  }

  beaconMalfunctions.forEach(beaconMalfunction => {
    if (beaconMalfunction.beaconStatus?.malfunctionStartDateTime) {
      const year = new Date(beaconMalfunction.beaconStatus?.malfunctionStartDateTime).getUTCFullYear()

      if (nextYearsToBeaconMalfunctions[year]?.length) {
        nextYearsToBeaconMalfunctions[year] = nextYearsToBeaconMalfunctions[year].concat(beaconMalfunction)
      } else {
        nextYearsToBeaconMalfunctions[year] = [beaconMalfunction]
      }
    }
  })

  return nextYearsToBeaconMalfunctions
}

function initYears (beaconMalfunctionsFromDate, nextYearsToBeaconMalfunctions) {
  let fromYear = beaconMalfunctionsFromDate.getUTCFullYear() + 1
  while (fromYear < new Date().getUTCFullYear()) {
    nextYearsToBeaconMalfunctions[fromYear] = []
    fromYear += 1
  }
}

/**
 * Get the number of sea and port beacon malfunctions for a given list of beacon malfunctions
 * @memberOf BeaconMalfunction
 * @param {BeaconStatusWithDetails[]} beaconMalfunctions
 * @returns {{
 *  numberOfBeaconMalfunctionsAtSea: number,
 *  numberOfBeaconMalfunctionsAtPort: number
 * }} The sum of beacon malfunctions at sea and port
 */
const getNumberOfSeaAndLandBeaconMalfunctions = beaconMalfunctions => {
  const numberOfBeaconMalfunctionsAtSea = getNumberOfBeaconMalfunctionsAt(BeaconMalfunctionVesselStatus.AT_SEA, beaconMalfunctions)
  const numberOfBeaconMalfunctionsAtPort = getNumberOfBeaconMalfunctionsAt(BeaconMalfunctionVesselStatus.AT_PORT, beaconMalfunctions)

  return {
    numberOfBeaconMalfunctionsAtSea: numberOfBeaconMalfunctionsAtSea,
    numberOfBeaconMalfunctionsAtPort: numberOfBeaconMalfunctionsAtPort
  }
}

/**
 * Get the number of beacon malfunctions at Port or at Sea
 * @memberOf BeaconMalfunction
 * @param {string<BeaconMalfunctionVesselStatus>} vesselStatus - The vessel status : at Sea or at Port
 * @param {BeaconStatusWithDetails[]} beaconMalfunctionsWithDetails
 * @returns {number} The sum of beacon malfunctions at sea and port
 */
const getNumberOfBeaconMalfunctionsAt = (vesselStatus, beaconMalfunctionsWithDetails) => {
  return beaconMalfunctionsWithDetails
    .filter(beaconStatusWithDetails => getFirstVesselStatus(beaconStatusWithDetails) === vesselStatus)
    .length
}

/**
 * Get the first vessel status of a beacon malfunction
 * @memberOf BeaconMalfunction
 * @param {BeaconStatusWithDetails} beaconStatusWithDetails
 * @returns {string<BeaconMalfunctionVesselStatus>} The vessel status
 */
const getFirstVesselStatus = beaconStatusWithDetails => {
  const beaconMalfunctionsVesselStatusActions = beaconStatusWithDetails.actions
    .filter ( action => action.propertyName === BeaconMalfunctionPropertyName.VESSEL_STATUS )

  switch (beaconMalfunctionsVesselStatusActions.length === 0) {
    case true: return beaconStatusWithDetails.beaconStatus.vesselStatus
    case false: _.minBy(beaconMalfunctionsVesselStatusActions, action => action.dateTime)
  }
}

export {
  getYearsToBeaconMalfunctions,
  getNumberOfSeaAndLandBeaconMalfunctions,
  getFirstVesselStatus,
  UserType,
  BeaconMalfunctionPropertyName,
  BeaconMalfunctionVesselStatus,
  vesselStatuses,
  BeaconMalfunctionsTab
}
