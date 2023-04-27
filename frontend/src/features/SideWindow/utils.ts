import { BeaconMalfunctionsSubMenu } from './beacon_malfunctions/beaconMalfunctions'
import { SideWindowMenuKey } from './constants'
import { ALERTS_SUBMENU } from '../../domain/entities/alerts/constants'

import type { SeaFrontGroup } from '../../constants'
import type { MenuItem } from '../../types'

export function getSelectedSubMenu(
  openedSideWindowTab: SideWindowMenuKey | undefined
): MenuItem<SeaFrontGroup | string> {
  return !openedSideWindowTab || openedSideWindowTab === SideWindowMenuKey.ALERTS
    ? ALERTS_SUBMENU.MEMN
    : BeaconMalfunctionsSubMenu.MALFUNCTIONING
}
