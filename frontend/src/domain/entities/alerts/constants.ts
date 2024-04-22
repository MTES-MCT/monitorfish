// TODO This is a bit shady to mix up pending/silenced alerts with PNO ones here.

import {
  ALL_SEA_FRONT_GROUP,
  SEA_FRONT_GROUP_SEA_FRONTS,
  SeaFront,
  SeaFrontGroup,
  type AllSeaFrontGroup
} from '@constants/seaFront'

import { PendingAlertValueType } from './types'

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
  SeaFrontGroup | AllSeaFrontGroup,
  {
    menuSeaFront: SeaFrontGroup | AllSeaFrontGroup
    seaFronts: SeaFront[]
  }
> = {
  ALL_SEA_FRONT_GROUP: {
    menuSeaFront: ALL_SEA_FRONT_GROUP,
    seaFronts: [
      SeaFront.CORSE,
      SeaFront.GUADELOUPE,
      SeaFront.GUYANE,
      SeaFront.MARTINIQUE,
      SeaFront.MAYOTTE,
      SeaFront.MED,
      SeaFront.MEMN,
      SeaFront.NAMO,
      SeaFront.SA,
      SeaFront.SUD_OCEAN_INDIEN
    ]
  },
  MED: {
    menuSeaFront: SeaFrontGroup.MED,
    seaFronts: SEA_FRONT_GROUP_SEA_FRONTS.MED
  },
  MEMN: {
    menuSeaFront: SeaFrontGroup.MEMN,
    seaFronts: SEA_FRONT_GROUP_SEA_FRONTS.MEMN
  },
  NAMO: {
    menuSeaFront: SeaFrontGroup.NAMO,
    seaFronts: SEA_FRONT_GROUP_SEA_FRONTS.NAMO
  },
  OUTREMEROA: {
    menuSeaFront: SeaFrontGroup.OUTREMEROA,
    seaFronts: SEA_FRONT_GROUP_SEA_FRONTS.OUTREMEROA
  },
  OUTREMEROI: {
    menuSeaFront: SeaFrontGroup.OUTREMEROI,
    seaFronts: SEA_FRONT_GROUP_SEA_FRONTS.OUTREMEROI
  },
  SA: {
    menuSeaFront: SeaFrontGroup.SA,
    seaFronts: SEA_FRONT_GROUP_SEA_FRONTS.SA
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
