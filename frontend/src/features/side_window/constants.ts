import type { MenuItem } from '../../types'

export enum SideWindowMenuKey {
  ALERTS = 'ALERTS',
  BEACON_MALFUNCTIONS = 'BEACON_MALFUNCTIONS'
}

export const SIDE_WINDOW_MENU: Record<SideWindowMenuKey, MenuItem<SideWindowMenuKey>> = {
  ALERTS: {
    code: SideWindowMenuKey.ALERTS,
    name: 'Alertes'
  },
  BEACON_MALFUNCTIONS: {
    code: SideWindowMenuKey.BEACON_MALFUNCTIONS,
    name: 'Suivi VMS'
  }
}

export enum AlertAndReportingTab {
  ALERT = 'ALERT',
  REPORTING = 'REPORTING'
}
