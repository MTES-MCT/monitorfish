import { SeaFrontGroup } from '@constants/seaFront'

export enum AdditionalSubMenu {
  SUSPENDED_ALERTS = 'SUSPENDED_ALERTS'
}

export type SideWindowSubMenu = SeaFrontGroup | AdditionalSubMenu
