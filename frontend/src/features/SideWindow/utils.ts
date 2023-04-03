import { BeaconMalFunctionSubMenuFilter } from './beacon_malfunctions/constants'
import { SideWindowMenuKey } from './constants'
import { SeaFrontGroup } from '../../constants'

export function getSelectedSubMenu(openedSideWindowTab: SideWindowMenuKey | undefined): string {
  return !openedSideWindowTab || openedSideWindowTab === SideWindowMenuKey.ALERTS
    ? // Alert list is the default side window selected menu and this is its default selected submenu
      SeaFrontGroup.MEMN
    : BeaconMalFunctionSubMenuFilter.MALFUNCTIONING
}
