import { BeaconMalfunctionsSubMenu } from './BeaconMalfunctionBoard/beaconMalfunctions'
import { ALERTS_SUBMENU } from '../../domain/entities/alerts/constants'
import { SideWindowMenuKey } from '../../domain/entities/sideWindow/constants'

import type { SeaFrontGroup } from '../../constants'
import type { MenuItem } from '../../types'

export function getSelectedSubMenu(
  openedSideWindowTab: SideWindowMenuKey | undefined
): MenuItem<SeaFrontGroup | string> {
  return !openedSideWindowTab || openedSideWindowTab === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST
    ? ALERTS_SUBMENU.MEMN
    : BeaconMalfunctionsSubMenu.MALFUNCTIONING
}
