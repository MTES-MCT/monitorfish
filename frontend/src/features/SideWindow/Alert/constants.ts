import { SeafrontGroup } from '@constants/seafront'
import { getOptionsFromLabelledEnum } from '@mtes-mct/monitor-ui'

export enum AdditionalSubMenu {
  SUSPENDED_ALERTS = 'SUSPENDED_ALERTS'
}

export type AlertSubMenu = SeafrontGroup | AdditionalSubMenu

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const SUB_MENU_LABEL: Record<AlertSubMenu, string> = {
  MEMN: 'MEMN',
  NAMO: 'NAMO',
  SA: 'SA',
  MED: 'MED',
  OUTREMEROA: 'OUTRE-MER OA',
  OUTREMEROI: 'OUTRE-MER OI',
  SUSPENDED_ALERTS: 'Suspension d’alertes'
}
/* eslint-enable sort-keys-fix/sort-keys-fix */

export const ALERT_SUB_MENU_OPTIONS = getOptionsFromLabelledEnum(SUB_MENU_LABEL)
