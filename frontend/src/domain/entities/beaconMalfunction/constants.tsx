import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { ReactComponent as VesselStatusActivityDetectedSVG } from '../../../features/icons/Avarie_statut_activite_detectee.svg'
import { ReactComponent as VesselStatusAtPortSVG } from '../../../features/icons/Avarie_statut_navire_a_quai.svg'
import { ReactComponent as VesselStatusAtSeaSVG } from '../../../features/icons/Avarie_statut_navire_en_mer.svg'
import { ReactComponent as VesselStatusNoNewsSVG } from '../../../features/icons/Avarie_statut_sans_nouvelles.svg'
import { ReactComponent as VesselStatusNeverEmittedSVG } from '../../../features/icons/never_emitted.svg'

import type {
  BeaconMalfunctionStageColumnValue,
  BeaconMalfunctionStatusValue,
  EnfOfBeaconMalfunctionStatusValue
} from '../../types/beaconMalfunction'

enum BeaconMalfunctionsTab {
  DETAIL = 2,
  RESUME = 1
}

enum UserType {
  OPS = 'OPS',
  SIP = 'SIP'
}

enum BeaconMalfunctionPropertyName {
  STAGE = 'STAGE',
  VESSEL_STATUS = 'VESSEL_STATUS'
}

enum BeaconMalfunctionVesselStatus {
  ACTIVITY_DETECTED = 'ACTIVITY_DETECTED',
  AT_PORT = 'AT_PORT',
  AT_SEA = 'AT_SEA',
  NEVER_EMITTED = 'NEVER_EMITTED',
  NO_NEWS = 'NO_NEWS'
}

const VesselStatusAtPort = styled(VesselStatusAtPortSVG)``
const VesselStatusAtSea = styled(VesselStatusAtSeaSVG)``
const VesselStatusNoNews = styled(VesselStatusNoNewsSVG)``
const VesselStatusNeverEmitted = styled(VesselStatusNeverEmittedSVG)``
const VesselStatusActivityDetected = styled(VesselStatusActivityDetectedSVG)``

const iconStyle = {
  height: 17,
  verticalAlign: 'sub'
}

const VESSEL_STATUS: BeaconMalfunctionStatusValue[] = [
  {
    color: '#F4DEAF',
    hoursOffsetToRetrieveMalfunctionCreation: 60,
    icon: <VesselStatusAtPort style={iconStyle} />,
    label: 'Navire à quai',
    textColor: COLORS.charcoal,
    value: 'AT_PORT'
  },
  {
    color: '#9ED7D9',
    hoursOffsetToRetrieveMalfunctionCreation: 6,
    icon: <VesselStatusAtSea style={iconStyle} />,
    label: 'Navire en mer',
    textColor: COLORS.charcoal,
    value: 'AT_SEA'
  },
  {
    color: '#E6BC51',
    hoursOffsetToRetrieveMalfunctionCreation: undefined,
    icon: <VesselStatusNoNews style={iconStyle} />,
    label: 'Sans nouvelles',
    textColor: COLORS.charcoal,
    value: 'NO_NEWS'
  },
  {
    color: COLORS.charcoal,
    hoursOffsetToRetrieveMalfunctionCreation: undefined,
    icon: <VesselStatusNeverEmitted style={iconStyle} />,
    label: "N'a jamais émis",
    textColor: COLORS.white,
    value: 'NEVER_EMITTED'
  },
  {
    color: '#C41812',
    hoursOffsetToRetrieveMalfunctionCreation: undefined,
    icon: <VesselStatusActivityDetected style={iconStyle} />,
    label: 'Activité détectée',
    textColor: COLORS.white,
    value: 'ACTIVITY_DETECTED'
  }
]

export enum EndOfBeaconMalfunctionReason {
  BEACON_DEACTIVATED_OR_UNEQUIPPED = 'BEACON_DEACTIVATED_OR_UNEQUIPPED',
  RESUMED_TRANSMISSION = 'RESUMED_TRANSMISSION'
}

const END_OF_MALFUNCTION_REASON_RECORD: Record<EndOfBeaconMalfunctionReason, EnfOfBeaconMalfunctionStatusValue> = {
  BEACON_DEACTIVATED_OR_UNEQUIPPED: {
    color: COLORS.opal,
    label: 'Balise désactivée / navire non-équipé',
    textColor: COLORS.gunMetal,
    value: 'BEACON_DEACTIVATED_OR_UNEQUIPPED'
  },
  RESUMED_TRANSMISSION: {
    color: COLORS.mediumSeaGreen,
    label: 'Reprise des émissions',
    textColor: COLORS.white,
    value: 'RESUMED_TRANSMISSION'
  }
}

export enum BeaconMalfunctionsStage {
  ARCHIVED = 'ARCHIVED',
  AT_QUAY = 'AT_QUAY',
  END_OF_MALFUNCTION = 'END_OF_MALFUNCTION',
  FOLLOWING = 'FOLLOWING',
  FOUR_HOUR_REPORT = 'FOUR_HOUR_REPORT',
  INITIAL_ENCOUNTER = 'INITIAL_ENCOUNTER',
  RESUMED_TRANSMISSION = 'RESUMED_TRANSMISSION',
  TARGETING_VESSEL = 'TARGETING_VESSEL'
}

/* eslint-disable sort-keys-fix/sort-keys-fix */
/**
 * Sort keys are disabled as keys order dictates Kanban columns ordering
 */
const STAGE_RECORD: Record<BeaconMalfunctionsStage, BeaconMalfunctionStageColumnValue> = {
  INITIAL_ENCOUNTER: {
    index: 0,
    code: 'INITIAL_ENCOUNTER',
    description: "Obtenir une réponse des navires qui ont cessé d'émettre.",
    isColumn: true,
    title: 'Premier contact'
  },
  FOUR_HOUR_REPORT: {
    index: 1,
    code: 'FOUR_HOUR_REPORT',
    description: "Suivre les navires qui font leurs 4h report ou les relancer s'ils l'ont cessé.",
    isColumn: true,
    title: '4h report'
  },
  AT_QUAY: {
    index: 2,
    code: 'AT_QUAY',
    description:
      "Relancer les navires qui sont à quai (ou supposés à quai) et qui n'ont pas encore repris leurs émissions.",
    isColumn: true,
    title: 'Navires supposés à quai'
  },
  FOLLOWING: {
    index: 3,
    code: 'FOLLOWING',
    description: '',
    isColumn: true,
    title: 'Suivi en cours'
  },
  TARGETING_VESSEL: {
    index: 4,
    code: 'TARGETING_VESSEL',
    description:
      "Mobiliser les unités sur les navires dont on n'a pas de nouvelles et/ou qui sont actifs en mer sans VMS.",
    isColumn: true,
    title: 'Ciblage du navire'
  },
  END_OF_MALFUNCTION: {
    index: 5,
    code: 'END_OF_MALFUNCTION',
    description:
      "Envoyer un message de reprise aux unités dont les émissions ont repris et archiver les avaries qu'on ne suit plus.",
    isColumn: true,
    title: "Fin de l'avarie"
  },
  ARCHIVED: {
    index: 6,
    code: 'ARCHIVED',
    description: 'Avaries clôturées.\n NB : Seules les 30 dernières avaries restent dans le kanban.',
    isColumn: true,
    title: 'Archivage'
  },
  /** Old stages - for backward compatibility * */
  RESUMED_TRANSMISSION: {
    index: undefined,
    code: 'RESUMED_TRANSMISSION',
    isColumn: false,
    title: 'Reprise des émissions'
  }
}
/* eslint-enable sort-keys-fix/sort-keys-fix */

const NOTIFICATION_TYPE = {
  END_OF_MALFUNCTION: {
    followUpMessage: "Notification de fin d'avarie",
    preposition: 'de la'
  },
  MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION: {
    followUpMessage: "Notification initiale d'avarie à quai",
    preposition: 'de la'
  },
  MALFUNCTION_AT_PORT_REMINDER: {
    followUpMessage: 'Relance pour avarie à quai',
    preposition: "d'une"
  },
  MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION: {
    followUpMessage: "Notification initiale d'avarie en mer",
    preposition: 'de la'
  },
  MALFUNCTION_AT_SEA_REMINDER: {
    followUpMessage: 'Relance pour avarie en mer',
    preposition: "d'une"
  }
}

const COMMUNICATION_MEAN = {
  EMAIL: {
    addresseePreposition: 'à',
    denomination: 'email',
    value: 'EMAIL'
  },
  FAX: {
    addresseePreposition: 'au',
    denomination: 'fax',
    value: 'FAX'
  },
  SMS: {
    addresseePreposition: 'au',
    denomination: 'SMS',
    value: 'SMS'
  }
}

const NOTIFICATION_RECIPIENT_FUNCTION = {
  FMC: {
    addressee: 'CNSP',
    value: 'FMC'
  },
  SATELLITE_OPERATOR: {
    addressee: 'Opérateur sat.',
    value: 'SATELLITE_OPERATOR'
  },
  VESSEL_CAPTAIN: {
    addressee: 'Capitaine',
    value: 'VESSEL_CAPTAIN'
  },
  VESSEL_OPERATOR: {
    addressee: 'Armateur',
    value: 'VESSEL_OPERATOR'
  }
}

export {
  UserType,
  BeaconMalfunctionPropertyName,
  BeaconMalfunctionVesselStatus,
  VESSEL_STATUS,
  BeaconMalfunctionsTab,
  END_OF_MALFUNCTION_REASON_RECORD,
  STAGE_RECORD,
  NOTIFICATION_TYPE,
  COMMUNICATION_MEAN,
  NOTIFICATION_RECIPIENT_FUNCTION
}
