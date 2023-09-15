// TODO This is a bit shady to mix up pending/silenced alerts with PNO ones here.

import { PendingAlertValueType } from './types'
import { SeaFrontGroup } from '../seaFront/constants'

import type { MenuItem } from '../../../types'

export const COMMON_ALERT_TYPE_OPTION: Record<
  PendingAlertValueType | 'PNO_LAN_WEIGHT_TOLERANCE_ALERT',
  MenuItem<PendingAlertValueType | 'PNO_LAN_WEIGHT_TOLERANCE_ALERT'> & {
    isOperationalAlert: boolean
    nameWithAlertDetails?: Function
  }
> = {
  FRENCH_EEZ_FISHING_ALERT: {
    code: PendingAlertValueType.FRENCH_EEZ_FISHING_ALERT,
    isOperationalAlert: true,
    name: 'Pêche en ZEE française par un navire tiers'
  },
  MISSING_FAR_48_HOURS_ALERT: {
    code: PendingAlertValueType.MISSING_FAR_48_HOURS_ALERT,
    isOperationalAlert: true,
    name: 'Non-emission de message "FAR" en 48h'
  },
  MISSING_FAR_ALERT: {
    code: PendingAlertValueType.MISSING_FAR_ALERT,
    isOperationalAlert: true,
    name: 'Non-emission de message "FAR"'
  },
  PNO_LAN_WEIGHT_TOLERANCE_ALERT: {
    code: 'PNO_LAN_WEIGHT_TOLERANCE_ALERT',
    isOperationalAlert: false,
    name: 'Tolérance 10% non respectée',
    nameWithAlertDetails: (percentOfTolerance, minimumWeightThreshold) =>
      `Tolérance de ${percentOfTolerance}% non respectée, appliquée pour un poids minimum de ${minimumWeightThreshold}kg.`
  },
  THREE_MILES_TRAWLING_ALERT: {
    code: PendingAlertValueType.THREE_MILES_TRAWLING_ALERT,
    isOperationalAlert: true,
    name: '3 milles - Chaluts'
  },
  TWELVE_MILES_FISHING_ALERT: {
    code: PendingAlertValueType.TWELVE_MILES_FISHING_ALERT,
    isOperationalAlert: true,
    name: '12 milles - Pêche sans droits historiques'
  }
}

// TODO Rename the `seaFronts` prop to clarify the difference. They don't look like seas fronts.
export const ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS: Record<
  SeaFrontGroup,
  {
    menuSeaFront: SeaFrontGroup
    seaFronts: string[]
  }
> = {
  ALL: {
    menuSeaFront: SeaFrontGroup.ALL,
    seaFronts: []
  },
  MED: {
    menuSeaFront: SeaFrontGroup.MED,
    seaFronts: ['MED']
  },
  MEMN: {
    menuSeaFront: SeaFrontGroup.MEMN,
    seaFronts: ['MEMN']
  },
  NAMO: {
    menuSeaFront: SeaFrontGroup.NAMO,
    seaFronts: ['NAMO']
  },
  OUTREMEROA: {
    menuSeaFront: SeaFrontGroup.OUTREMEROA,
    seaFronts: ['Guadeloupe', 'Guyane', 'Martinique']
  },
  OUTREMEROI: {
    menuSeaFront: SeaFrontGroup.OUTREMEROI,
    seaFronts: ['Sud Océan Indien']
  },
  SA: {
    menuSeaFront: SeaFrontGroup.SA,
    seaFronts: [SeaFrontGroup.SA]
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

export const operationalAlertTypes = Object.keys(COMMON_ALERT_TYPE_OPTION)
  .map(alertTypeName => COMMON_ALERT_TYPE_OPTION[alertTypeName])
  .filter(alertType => alertType.isOperationalAlert)
