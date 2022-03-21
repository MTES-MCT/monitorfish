import _ from 'lodash'
import styled from 'styled-components'
import { ReactComponent as VesselStatusNoNewsSVG } from '../../features/icons/Avarie_statut_sans_nouvelles.svg'
import { ReactComponent as VesselStatusNeverEmittedSVG } from '../../features/icons/never_emitted.svg'
import { ReactComponent as VesselStatusAtPortSVG } from '../../features/icons/Avarie_statut_navire_a_quai.svg'
import { COLORS } from '../../constants/constants'
import React from 'react'
import { ReactComponent as VesselStatusAtSeaSVG } from '../../features/icons/Avarie_statut_navire_en_mer.svg'
import { ReactComponent as VesselStatusActivityDetectedSVG } from '../../features/icons/Avarie_statut_activite_detectee.svg'
import { getReducedTimeAgo } from '../../features/side_window/beacon_malfunctions/beaconMalfunctions'
import { getDate } from '../../utils'

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
  NEVER_EMITTED: 'NEVER_EMITTED',
  ACTIVITY_DETECTED: 'ACTIVITY_DETECTED'
}

const VesselStatusAtPort = styled(VesselStatusAtPortSVG)``
const VesselStatusAtSea = styled(VesselStatusAtSeaSVG)``
const VesselStatusNoNews = styled(VesselStatusNoNewsSVG)``
const VesselStatusNeverEmitted = styled(VesselStatusNeverEmittedSVG)``
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
    color: '#E6BC51',
    textColor: COLORS.charcoal,
    icon: <VesselStatusNoNews style={iconStyle}/>
  },
  {
    label: 'N\'a jamais émis',
    value: 'NEVER_EMITTED',
    color: COLORS.charcoal,
    textColor: COLORS.white,
    icon: <VesselStatusNeverEmitted style={iconStyle}/>
  },
  {
    label: 'Activité détectée',
    value: 'ACTIVITY_DETECTED',
    color: '#C41812',
    textColor: COLORS.white,
    icon: <VesselStatusActivityDetected style={iconStyle}/>
  }
]

const endOfBeaconMalfunctionReasons = {
  'RESUMED_TRANSMISSION': {
    label: 'Reprise des émissions',
    value: 'RESUMED_TRANSMISSION',
    color: COLORS.mediumSeaGreen,
    textColor: COLORS.white
  },
  'TEMPORARY_INTERRUPTION_OF_SUPERVISION': {
    label: 'Arrêt temporaire du suivi',
    value: 'TEMPORARY_INTERRUPTION_OF_SUPERVISION',
    color: COLORS.opal,
    textColor: COLORS.gunMetal
  },
  'PERMANENT_INTERRUPTION_OF_SUPERVISION': {
    label: 'Arrêt définitif du suivi',
    value: 'PERMANENT_INTERRUPTION_OF_SUPERVISION',
    color: COLORS.opal,
    textColor: COLORS.gunMetal
  }
}

/**
 * Get beacon malfunctions for each years : Years are keys and beacon malfunctions are values
 * @memberOf BeaconMalfunction
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
 * @param {BeaconMalfunctionResumeAndDetails[]} beaconMalfunctions
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
 * @param {BeaconMalfunctionResumeAndDetails[]} beaconMalfunctionsWithDetails
 * @returns {number} The sum of beacon malfunctions at sea and port
 */
const getNumberOfBeaconMalfunctionsAt = (vesselStatus, beaconMalfunctionsWithDetails) => {
  return beaconMalfunctionsWithDetails
    .filter(beaconMalfunctionWithDetails => getFirstVesselStatus(beaconMalfunctionWithDetails) === vesselStatus)
    .length
}

/**
 * Get the first vessel status of a beacon malfunction
 * @memberOf BeaconMalfunction
 * @param {BeaconMalfunctionResumeAndDetails} beaconMalfunctionWithDetails
 * @returns {string<BeaconMalfunctionVesselStatus>} The vessel status
 */
const getFirstVesselStatus = beaconMalfunctionWithDetails => {
  const beaconMalfunctionsVesselStatusActions = beaconMalfunctionWithDetails.actions
    .filter ( action => action.propertyName === BeaconMalfunctionPropertyName.VESSEL_STATUS )

  switch (beaconMalfunctionsVesselStatusActions.length === 0) {
    case true: return beaconMalfunctionWithDetails.beaconMalfunction.vesselStatus
    case false: _.minBy(beaconMalfunctionsVesselStatusActions, action => action.dateTime)
  }
}

export const beaconMalfunctionsStages = {
  INITIAL_ENCOUNTER: {
    code: 'INITIAL_ENCOUNTER',
    title: 'Premier contact',
    description: 'Obtenir une réponse des navires qui ont cessé d\'émettre.'
  },
  FOUR_HOUR_REPORT: {
    code: 'FOUR_HOUR_REPORT',
    title: '4h report',
    description: 'Suivre les navires qui font leurs 4h report ou les relancer s\'ils l\'ont cessé.'
  },
  RELAUNCH_REQUEST: {
    code: 'RELAUNCH_REQUEST',
    title: 'Relance pour reprise',
    description: 'Relancer les navires qui sont à quai (ou supposés à quai) et qui n\'ont pas encore repris leurs émissions.'
  },
  TARGETING_VESSEL: {
    code: 'TARGETING_VESSEL',
    title: 'Ciblage du navire',
    description: 'Mobiliser les unités sur les navires dont on n\'a pas de nouvelles et/ou qui sont actifs en mer sans VMS.'
  },
  CROSS_CHECK: {
    code: 'CROSS_CHECK',
    title: 'Contrôle croisé',
    description: 'Mobiliser les unités sur les navires dont on n\'a pas de nouvelles et/ou qui sont actifs en mer sans VMS.'
  },
  END_OF_MALFUNCTION: {
    code: 'END_OF_MALFUNCTION',
    title: 'Fin de l\'avarie',
    description: 'Envoyer un message de reprise aux unités dont les émissions ont repris et archiver les avaries qu\'on ne suit plus'
  },
  ARCHIVED: {
    code: 'ARCHIVED',
    title: 'Archivage',
    description: 'Avaries clôturées. NB : Seules les 30 dernières avaries restent dans le kanban.'
  }
}

const getIsMalfunctioning = stage => stage !== beaconMalfunctionsStages.END_OF_MALFUNCTION.code &&
  stage !== beaconMalfunctionsStages.ARCHIVED.code

const getMalfunctionStartDateText = (vesselStatus, beaconMalfunction) => {
  if (beaconMalfunction?.stage === beaconMalfunctionsStages.END_OF_MALFUNCTION.code ||
    beaconMalfunction?.stage === beaconMalfunctionsStages.ARCHIVED.code) {
    switch (beaconMalfunction?.endOfBeaconMalfunctionReason) {
      case endOfBeaconMalfunctionReasons.RESUMED_TRANSMISSION.value: return `Reprise des émissions ${getReducedTimeAgo(beaconMalfunction?.malfunctionStartDateTime)}`
      case endOfBeaconMalfunctionReasons.PERMANENT_INTERRUPTION_OF_SUPERVISION.value: return `Balise désactivée ${getReducedTimeAgo(beaconMalfunction?.malfunctionStartDateTime)}`
      case endOfBeaconMalfunctionReasons.TEMPORARY_INTERRUPTION_OF_SUPERVISION.value: return `Balise désactivée ${getReducedTimeAgo(beaconMalfunction?.malfunctionStartDateTime)}`
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
  UserType,
  BeaconMalfunctionPropertyName,
  BeaconMalfunctionVesselStatus,
  vesselStatuses,
  BeaconMalfunctionsTab,
  endOfBeaconMalfunctionReasons,
  getIsMalfunctioning,
  getMalfunctionStartDateText
}
