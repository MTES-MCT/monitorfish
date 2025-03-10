// TODO This is a bit shady to mix up pending/silenced alerts with PNO ones here.

import {
  ALL_SEAFRONT_GROUP,
  SEAFRONT_GROUP_SEAFRONTS,
  Seafront,
  SeafrontGroup,
  type AllSeafrontGroup
} from '@constants/seafront'

import { PendingAlertValueType } from './types'

import type { MenuItem } from '../../types'

export const COMMON_ALERT_TYPE_OPTION: Record<
  PendingAlertValueType | 'PNO_LAN_WEIGHT_TOLERANCE_ALERT',
  MenuItem<PendingAlertValueType | 'PNO_LAN_WEIGHT_TOLERANCE_ALERT'> & {
    isArchivedAfterDEPMessage: boolean
    isOperationalAlert: boolean
    nameWithAlertDetails?: Function
  }
> = {
  BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT: {
    code: PendingAlertValueType.BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT,
    isArchivedAfterDEPMessage: false,
    isOperationalAlert: true,
    name: 'R(UE) 1241 - Plus de 6 tonnes de lingue bleue (BLI) à bord'
  },
  FRENCH_EEZ_FISHING_ALERT: {
    code: PendingAlertValueType.FRENCH_EEZ_FISHING_ALERT,
    isArchivedAfterDEPMessage: false,
    isOperationalAlert: true,
    name: 'Pêche en ZEE française par un navire tiers'
  },
  MISSING_DEP_ALERT: {
    code: PendingAlertValueType.MISSING_DEP_ALERT,
    isArchivedAfterDEPMessage: true,
    isOperationalAlert: true,
    name: 'Sortie sans émission de message "DEP"'
  },
  MISSING_FAR_48_HOURS_ALERT: {
    code: PendingAlertValueType.MISSING_FAR_48_HOURS_ALERT,
    isArchivedAfterDEPMessage: true,
    isOperationalAlert: true,
    name: 'Non-emission de message "FAR" en 48h'
  },
  MISSING_FAR_ALERT: {
    code: PendingAlertValueType.MISSING_FAR_ALERT,
    isArchivedAfterDEPMessage: true,
    isOperationalAlert: true,
    name: 'Non-emission de message "FAR"'
  },
  NEAFC_FISHING_ALERT: {
    code: PendingAlertValueType.NEAFC_FISHING_ALERT,
    isArchivedAfterDEPMessage: false,
    isOperationalAlert: true,
    name: 'Alerte de pêche en zone CPANE (NEAFC)'
  },
  PNO_LAN_WEIGHT_TOLERANCE_ALERT: {
    code: 'PNO_LAN_WEIGHT_TOLERANCE_ALERT',
    isArchivedAfterDEPMessage: false,
    isOperationalAlert: false,
    name: 'Tolérance 10% non respectée',
    nameWithAlertDetails: (percentOfTolerance, minimumWeightThreshold) =>
      `Tolérance de ${percentOfTolerance}% non respectée, appliquée pour un poids minimum de ${minimumWeightThreshold}kg.`
  },
  RTC_FISHING_ALERT: {
    code: PendingAlertValueType.RTC_FISHING_ALERT,
    isArchivedAfterDEPMessage: false,
    isOperationalAlert: true,
    name: 'Pêche en zone RTC'
  },
  SUSPICION_OF_UNDER_DECLARATION_ALERT: {
    code: PendingAlertValueType.SUSPICION_OF_UNDER_DECLARATION_ALERT,
    isArchivedAfterDEPMessage: true,
    isOperationalAlert: true,
    name: 'Suspicion de sous-déclaration'
  },
  THREE_MILES_TRAWLING_ALERT: {
    code: PendingAlertValueType.THREE_MILES_TRAWLING_ALERT,
    isArchivedAfterDEPMessage: true,
    isOperationalAlert: true,
    name: '3 milles - Chaluts'
  },
  TWELVE_MILES_FISHING_ALERT: {
    code: PendingAlertValueType.TWELVE_MILES_FISHING_ALERT,
    isArchivedAfterDEPMessage: false,
    isOperationalAlert: true,
    name: '12 milles - Pêche sans droits historiques'
  }
}

export const ALERTS_MENU_SEAFRONT_TO_SEAFRONTS: Record<
  SeafrontGroup | AllSeafrontGroup,
  {
    menuSeafront: SeafrontGroup | AllSeafrontGroup
    seafronts: Seafront[]
  }
> = {
  ALL: {
    menuSeafront: ALL_SEAFRONT_GROUP,
    seafronts: [
      Seafront.CORSE,
      Seafront.GUADELOUPE,
      Seafront.GUYANE,
      Seafront.MARTINIQUE,
      Seafront.MAYOTTE,
      Seafront.MED,
      Seafront.MEMN,
      Seafront.NAMO,
      Seafront.SA,
      Seafront.SUD_OCEAN_INDIEN
    ]
  },
  MED: {
    menuSeafront: SeafrontGroup.MED,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.MED
  },
  MEMN: {
    menuSeafront: SeafrontGroup.MEMN,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.MEMN
  },
  NAMO: {
    menuSeafront: SeafrontGroup.NAMO,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.NAMO
  },
  OUTREMEROA: {
    menuSeafront: SeafrontGroup.OUTREMEROA,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.OUTREMEROA
  },
  OUTREMEROI: {
    menuSeafront: SeafrontGroup.OUTREMEROI,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.OUTREMEROI
  },
  SA: {
    menuSeafront: SeafrontGroup.SA,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.SA
  }
}

export enum SilencedAlertPeriod {
  CUSTOM = 'CUSTOM',
  ONE_DAY = 'ONE_DAY',
  ONE_HOUR = 'ONE_HOUR',
  ONE_MONTH = 'ONE_MONTH',
  ONE_WEEK = 'ONE_WEEK',
  ONE_YEAR = 'ONE_YEAR',
  SIX_HOURS = 'SIX_HOURS',
  THIS_OCCURRENCE = 'THIS_OCCURRENCE',
  TWELVE_HOURS = 'TWELVE_HOURS',
  TWO_HOURS = 'TWO_HOURS'
}

export const OPERATIONAL_ALERTS = Object.keys(COMMON_ALERT_TYPE_OPTION)
  .map(alertTypeName => COMMON_ALERT_TYPE_OPTION[alertTypeName])
  .filter(alertType => alertType.isOperationalAlert)

export const ALERTS_ARCHIVED_AFTER_NEW_VOYAGE: string[] = Object.keys(COMMON_ALERT_TYPE_OPTION)
  .map(alertTypeName => COMMON_ALERT_TYPE_OPTION[alertTypeName])
  .filter(alertType => alertType.isArchivedAfterDEPMessage)
  .map(alert => alert.code)
