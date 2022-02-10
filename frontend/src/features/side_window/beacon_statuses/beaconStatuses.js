import { ReactComponent as VesselStatusAtPortSVG } from '../../icons/Avarie_statut_navire_a_quai.svg'
import { ReactComponent as VesselStatusAtSeaSVG } from '../../icons/Avarie_statut_navire_en_mer.svg'
import { ReactComponent as VesselStatusNoNewsSVG } from '../../icons/Avarie_statut_sans_nouvelles.svg'
import { ReactComponent as VesselStatusTechnicalStopSVG } from '../../icons/Avarie_statut_arret_tech.svg'
import { ReactComponent as VesselStatusActivityDetectedSVG } from '../../icons/Avarie_statut_activite_detectee.svg'
import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import * as timeago from 'timeago.js'

export const BeaconStatusesSubMenu = {
  PAIRING: {
    name: 'Apparaige des balises',
    code: 'PAIRING'
  },
  MALFUNCTIONING: {
    name: 'Avaries VMS en cours',
    code: 'MALFUNCTIONING'
  },
  HISTORIC: {
    name: 'Historique des avaries',
    code: 'MED'
  }
}

export const beaconStatusesStages = {
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
  RESUMED_TRANSMISSION: {
    code: 'RESUMED_TRANSMISSION',
    title: 'Reprise des émissions',
    description: 'Envoyer un message de reprise aux unités dont les émissions ont repris.'
  },
  END_OF_FOLLOW_UP: {
    code: 'END_OF_FOLLOW_UP',
    title: 'Fin de suivi',
    description: 'Avaries archivées'
  }
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

export const vesselStatuses = [
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

const BEACON_CREATION_AT_SEA_OFFSET = 6
const BEACON_CREATION_AT_PORT_OFFSET = 24

export const getBeaconCreationDate = (dateLastEmission, status) => {
  switch (status) {
    case 'AT_PORT': {
      const beaconCreationDate = new Date(dateLastEmission)
      beaconCreationDate.setHours(beaconCreationDate.getHours() + BEACON_CREATION_AT_PORT_OFFSET)

      return beaconCreationDate
    }
    case 'AT_SEA': {
      const beaconCreationDate = new Date(dateLastEmission)
      beaconCreationDate.setHours(beaconCreationDate.getHours() + BEACON_CREATION_AT_SEA_OFFSET)

      return beaconCreationDate
    }
    default: return dateLastEmission
  }
}

export function getBeaconCreationOrModificationDate (beaconStatus) {
  if (beaconStatus?.stage === beaconStatusesStages.INITIAL_ENCOUNTER.code) {
    return `ouverte ${getReducedTimeAgo(getBeaconCreationDate(beaconStatus?.malfunctionStartDateTime, beaconStatus?.vesselStatus))}`
  }

  return `modifiée ${getReducedTimeAgo(beaconStatus?.vesselStatusLastModificationDateTime)}`
}

export function getReducedTimeAgo (dateTime) {
  return timeago.format(dateTime, 'fr')
    .replace('semaines', 'sem.')
    .replace('semaine', 'sem.')
}
