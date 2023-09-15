import { SeaFrontGroup } from '../../../domain/entities/seaFront/constants'
import { getOptionsFromLabelledEnum } from '../../../utils/getOptionsFromLabelledEnum'

import type { Option } from '@mtes-mct/monitor-ui'

export enum AdditionalSubMenu {
  SUSPENDED_ALERTS = 'SUSPENDED_ALERTS'
}

export type AlertSubMenu = SeaFrontGroup | AdditionalSubMenu

/* eslint-disable typescript-sort-keys/string-enum */
export enum AlertSubMenuLabel {
  MEMN = 'MEMN',
  NAMO = 'NAMO',
  SA = 'SA',
  MED = 'MED',
  OUTREMEROA = 'OUTRE-MER OA',
  OUTREMEROI = 'OUTRE-MER OI',
  SUSPENDED_ALERTS = 'Suspension d’alertes'
}
/* eslint-enable typescript-sort-keys/string-enum */

export const ALERT_SUB_MENU_OPTIONS = getOptionsFromLabelledEnum(AlertSubMenuLabel) as Option<AlertSubMenu>[]
