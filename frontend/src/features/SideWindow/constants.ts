import { SeafrontGroup } from '@constants/seafront'

export enum AdditionalSubMenu {
  SUSPENDED_ALERTS = 'SUSPENDED_ALERTS'
}

export type SideWindowSubMenu = SeafrontGroup | AdditionalSubMenu
