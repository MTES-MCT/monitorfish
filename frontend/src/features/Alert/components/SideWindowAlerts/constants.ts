import { getOptionsFromLabelledEnum } from '@mtes-mct/monitor-ui'

import type { NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'

export enum AdditionalSubMenu {
  ALERT_RULES = 'ALERT_MANAGEMENT',
  SUSPENDED_ALERTS = 'SUSPENDED_ALERTS'
}

export type AlertSubMenu = SeafrontGroup | NoSeafrontGroup | AdditionalSubMenu

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const SUB_MENU_LABEL: Record<AlertSubMenu, string> = {
  MEMN: 'MEMN',
  NAMO: 'NAMO',
  SA: 'SA',
  MED: 'MED',
  OUTREMEROA: 'OUTRE-MER OA',
  OUTREMEROI: 'OUTRE-MER OI',
  NONE: 'Hors façade',
  SUSPENDED_ALERTS: 'Suspension d’alertes',
  ALERT_MANAGEMENT: 'Gestion alertes'
}
/* eslint-enable sort-keys-fix/sort-keys-fix */

export const ALERT_SUB_MENU_OPTIONS = getOptionsFromLabelledEnum(SUB_MENU_LABEL)
