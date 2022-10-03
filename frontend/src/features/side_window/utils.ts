import { ALERTS_SUBMENU, SeaFront } from '../../domain/entities/alerts/constants'
import { BeaconMalfunctionsSubMenu } from './beacon_malfunctions/beaconMalfunctions'
import { SideWindowMenuKey } from './constants'

import type { MenuItem } from '../../types'

export function getSelectedSeaFront(openedSideWindowTab: SideWindowMenuKey | undefined): MenuItem<SeaFront> {
  return !openedSideWindowTab || openedSideWindowTab === SideWindowMenuKey.ALERTS
    ? ALERTS_SUBMENU.MEMN
    : // TODO Why?
      (BeaconMalfunctionsSubMenu.MALFUNCTIONING as MenuItem<SeaFront>)
}
