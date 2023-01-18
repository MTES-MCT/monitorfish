import { BeaconMalfunctionsSubMenu } from './beacon_malfunctions/beaconMalfunctions'
import { SideWindowMenuKey } from './constants'
import { ALERTS_SUBMENU, SeaFront } from '../../domain/entities/alerts/constants'

import type { MenuItem } from '../../types'

export function getSelectedSubMenu(openedSideWindowTab: SideWindowMenuKey | undefined): MenuItem<SeaFront | string> {
  return !openedSideWindowTab || openedSideWindowTab === SideWindowMenuKey.ALERTS
    ? ALERTS_SUBMENU.MEMN
    : BeaconMalfunctionsSubMenu.MALFUNCTIONING
}
