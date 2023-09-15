import { SeaFrontGroup } from '../../domain/entities/seaFront/constants'

export enum AdditionalSubMenu {
  SUSPENDED_ALERTS = 'SUSPENDED_ALERTS'
}

export type SideWindowSubMenu = SeaFrontGroup | AdditionalSubMenu
