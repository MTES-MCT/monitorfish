import styled from 'styled-components'

import VesselStatusActivityDetectedSVG from '../../../features/icons/Avarie_statut_activite_detectee.svg?react'
import VesselStatusTechnicalStopSVG from '../../../features/icons/Avarie_statut_arret_tech.svg?react'
import VesselStatusAtPortSVG from '../../../features/icons/Avarie_statut_navire_a_quai.svg?react'
import VesselStatusAtSeaSVG from '../../../features/icons/Avarie_statut_navire_en_mer.svg?react'
import VesselStatusNoNewsSVG from '../../../features/icons/Avarie_statut_sans_nouvelles.svg?react'
import { theme } from '../../../ui/theme'

import type {
  BeaconMalfunctionStageColumnValue,
  BeaconMalfunctionStatusValue,
  EnfOfBeaconMalfunctionStatusValue
} from './types'

enum EquipmentTab {
  BEACON_MALFUNCTION_DETAIL = 2,
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
  IN_FOREIGN_EEZ = 'IN_FOREIGN_EEZ',
  NO_NEWS = 'NO_NEWS',
  ON_SALE = 'ON_SALE',
  SUSPENDED_BECAUSE_UNPAID = 'SUSPENDED_BECAUSE_UNPAID',
  TECHNICAL_STOP = 'TECHNICAL_STOP'
}

const VesselStatusAtPort = styled(VesselStatusAtPortSVG)``
const VesselStatusAtSea = styled(VesselStatusAtSeaSVG)``
const VesselStatusNoNews = styled(VesselStatusNoNewsSVG)``
const VesselStatusActivityDetected = styled(VesselStatusActivityDetectedSVG)``

const iconStyle = {
  height: 17,
  verticalAlign: 'sub'
}

const VESSEL_STATUS: BeaconMalfunctionStatusValue[] = [
  {
    color: theme.color.wheat,
    hoursOffsetToRetrieveMalfunctionCreation: 60,
    icon: <VesselStatusAtPort style={iconStyle} />,
    label: 'Navire à quai',
    textColor: theme.color.charcoal,
    value: 'AT_PORT'
  },
  {
    color: theme.color.powderBlue,
    hoursOffsetToRetrieveMalfunctionCreation: 6,
    icon: <VesselStatusAtSea style={iconStyle} />,
    label: 'Navire en mer',
    textColor: theme.color.charcoal,
    value: 'AT_SEA'
  },
  {
    color: '#E6BC51',
    hoursOffsetToRetrieveMalfunctionCreation: undefined,
    icon: <VesselStatusNoNews style={iconStyle} />,
    label: 'Sans nouvelles',
    textColor: theme.color.charcoal,
    value: 'NO_NEWS'
  },
  {
    color: theme.color.maximumRed,
    hoursOffsetToRetrieveMalfunctionCreation: undefined,
    icon: <VesselStatusActivityDetected style={iconStyle} />,
    label: 'Activité détectée',
    textColor: theme.color.white,
    value: 'ACTIVITY_DETECTED'
  },
  {
    color: theme.color.wheat,
    hoursOffsetToRetrieveMalfunctionCreation: undefined,
    icon: <VesselStatusTechnicalStopSVG style={iconStyle} />,
    label: 'En arrêt technique',
    textColor: theme.color.charcoal,
    value: 'TECHNICAL_STOP'
  },
  {
    color: theme.color.wheat,
    hoursOffsetToRetrieveMalfunctionCreation: undefined,
    icon: <VesselStatusAtPort style={iconStyle} />,
    label: 'En vente',
    textColor: theme.color.charcoal,
    value: 'ON_SALE'
  },
  {
    color: theme.color.maximumRed,
    hoursOffsetToRetrieveMalfunctionCreation: undefined,
    icon: <VesselStatusActivityDetected style={iconStyle} />,
    label: 'Suspendu cause impayé',
    textColor: theme.color.white,
    value: 'SUSPENDED_BECAUSE_UNPAID'
  },
  {
    color: theme.color.powderBlue,
    hoursOffsetToRetrieveMalfunctionCreation: undefined,
    icon: <VesselStatusAtSea style={iconStyle} />,
    label: 'Navire en ZEE étrangère',
    textColor: theme.color.charcoal,
    value: 'IN_FOREIGN_EEZ'
  }
]

export enum EndOfBeaconMalfunctionReason {
  BEACON_DEACTIVATED_OR_UNEQUIPPED = 'BEACON_DEACTIVATED_OR_UNEQUIPPED',
  RESUMED_TRANSMISSION = 'RESUMED_TRANSMISSION'
}

const END_OF_MALFUNCTION_REASON_RECORD: Record<EndOfBeaconMalfunctionReason, EnfOfBeaconMalfunctionStatusValue> = {
  BEACON_DEACTIVATED_OR_UNEQUIPPED: {
    color: theme.color.opal,
    label: 'Balise désactivée / navire non-équipé',
    textColor: theme.color.gunMetal,
    value: 'BEACON_DEACTIVATED_OR_UNEQUIPPED'
  },
  RESUMED_TRANSMISSION: {
    color: theme.color.mediumSeaGreen,
    label: 'Reprise des émissions',
    textColor: theme.color.white,
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
    description: "Relancer les navires supposés à quai et avec lesquels aucun contact n'a été établi.",
    isColumn: true,
    title: 'Navires supposés à quai'
  },
  FOLLOWING: {
    index: 3,
    code: 'FOLLOWING',
    description: "Suivre les navires avec lesquels un contact a été établi (réparation en cours, pause d'activité...)",
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
  ARCHIVED: {
    index: 6,
    code: 'ARCHIVED',
    description: 'NB : Seules les 60 dernières avaries restent dans le kanban.',
    isColumn: true,
    title: 'Avaries clôturées'
  },
  /** Old stages - for backward compatibility
   *
   * /!\ These values are no more used. The value is kept to display historic `stage` values.
   */
  RESUMED_TRANSMISSION: {
    index: undefined,
    code: 'RESUMED_TRANSMISSION',
    isColumn: false,
    title: 'Reprise des émissions'
  },
  END_OF_MALFUNCTION: {
    index: 5,
    code: 'END_OF_MALFUNCTION',
    description:
      "Envoyer un message de reprise aux unités dont les émissions ont repris et archiver les avaries qu'on ne suit plus.",
    isColumn: false,
    title: "Fin de l'avarie"
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
  MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION_UNSUPERVISED_BEACON: {
    followUpMessage: "Notification d'avarie à quai",
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
  MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION_UNSUPERVISED_BEACON: {
    followUpMessage: "Notification d'avarie en mer",
    preposition: 'de la'
  },
  MALFUNCTION_AT_SEA_REMINDER: {
    followUpMessage: 'Relance pour avarie en mer',
    preposition: "d'une"
  },
  MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC: {
    followUpMessage: 'Notification à un FMC étranger',
    preposition: 'de la'
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
  FOREIGN_FMC: {
    addressee: 'FMC étranger',
    value: 'FOREIGN_FMC'
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
  EquipmentTab,
  END_OF_MALFUNCTION_REASON_RECORD,
  STAGE_RECORD,
  NOTIFICATION_TYPE,
  COMMUNICATION_MEAN,
  NOTIFICATION_RECIPIENT_FUNCTION
}
