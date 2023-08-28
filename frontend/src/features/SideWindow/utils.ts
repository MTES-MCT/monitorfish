import { SideWindowSubMenu } from './constants'
import { ALERTS_SUBMENU } from '../../domain/entities/alerts/constants'
import { SideWindowMenuKey } from '../../domain/entities/sideWindow/constants'

import type { MenuItem } from '../../types'

export function getSelectedSubMenu(
  openedSideWindowTab: SideWindowMenuKey | undefined
): MenuItem<SideWindowSubMenu> | undefined {
  return !openedSideWindowTab || openedSideWindowTab === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST
    ? ALERTS_SUBMENU.MEMN
    : undefined
}
