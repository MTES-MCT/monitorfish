import { ReactComponent as VesselStatusAtPortSVG } from '../../icons/Avarie_statut_navire_a_quai.svg'
import { ReactComponent as VesselStatusAtSeaSVG } from '../../icons/Avarie_statut_navire_en_mer.svg'
import { ReactComponent as VesselStatusNoNewsSVG } from '../../icons/Avarie_statut_sans_nouvelles.svg'
import { ReactComponent as VesselStatusTechnicalStopSVG } from '../../icons/Avarie_statut_arret_tech.svg'
import { ReactComponent as VesselStatusActivityDetectedSVG } from '../../icons/Avarie_statut_activite_detectee.svg'
import React from 'react'
import styled from 'styled-components'

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
    title: 'PREMIER CONTACT',
    description: 'Obtenir une réponse des navires qui ont cessé d\'émettre.'
  },
  FOUR_HOUR_REPORT: {
    code: 'FOUR_HOUR_REPORT',
    title: '4H REPORT',
    description: 'Suivre les navires qui font leurs 4h report ou les relancer s\'ils l\'ont cessé.'
  },
  RELAUNCH_REQUEST: {
    code: 'RELAUNCH_REQUEST',
    title: 'RELANCE POUR REPRISE',
    description: 'Relancer les navires qui sont à quai (ou supposés à quai) et qui n\'ont pas encore repris leurs émissions.'
  },
  TARGETING_VESSEL: {
    code: 'TARGETING_VESSEL',
    title: 'CIBLAGE DU NAVIRE',
    description: 'Mobiliser les unités sur les navires dont on n\'a pas de nouvelles et/ou qui sont actifs en mer sans VMS.'
  },
  CROSS_CHECK: {
    code: 'CROSS_CHECK',
    title: 'CONTRÔLE CROISÉ',
    description: 'Mobiliser les unités sur les navires dont on n\'a pas de nouvelles et/ou qui sont actifs en mer sans VMS.'
  },
  RESUMED_TRANSMISSION: {
    code: 'RESUMED_TRANSMISSION',
    title: 'REPRISE DES ÉMISSIONS',
    description: 'Envoyer un message de reprise aux unités dont les émissions ont repris.'
  }
}

const VesselStatusAtPort = styled(VesselStatusAtPortSVG)`
  vertical-align: sub;
`
const VesselStatusAtSea = styled(VesselStatusAtSeaSVG)`
  vertical-align: sub;
`
const VesselStatusNoNews = styled(VesselStatusNoNewsSVG)`
  vertical-align: sub;
`
const VesselStatusTechnicalStop = styled(VesselStatusTechnicalStopSVG)`
  vertical-align: sub;
`
const VesselStatusActivityDetected = styled(VesselStatusActivityDetectedSVG)`
  vertical-align: sub;
`

export const vesselStatuses = [
  {
    label: 'Navire à quai',
    value: 'AT_PORT',
    color: '#F4DEAF',
    icon: <VesselStatusAtPort/>
  },
  {
    label: 'Navire en mer',
    value: 'AT_SEA',
    color: '#9ED7D9',
    icon: <VesselStatusAtSea/>
  },
  {
    label: 'Sans nouvelles',
    value: 'NO_NEWS',
    color: '#F7BA9E',
    icon: <VesselStatusNoNews/>
  },
  {
    label: 'En arrêt technique',
    value: 'TECHNICAL_STOP',
    color: '#E8CA46',
    icon: <VesselStatusTechnicalStop/>
  },
  {
    label: 'Activité détectée',
    value: 'ACTIVITY_DETECTED',
    color: '#C41812',
    icon: <VesselStatusActivityDetected/>
  }
]
