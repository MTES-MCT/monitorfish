import type { MenuItem } from '../../types'

export enum SideWindowMenuKey {
  ALERTS = 'Alertes',
  BEACON_MALFUNCTIONS = 'Suivi VMS',
  MISSIONS = 'Missions et contrôles'
}

export const SIDE_WINDOW_MENU: Record<keyof typeof SideWindowMenuKey, MenuItem<SideWindowMenuKey>> = {
  ALERTS: {
    code: SideWindowMenuKey.ALERTS,
    name: SideWindowMenuKey.ALERTS
  },
  BEACON_MALFUNCTIONS: {
    code: SideWindowMenuKey.BEACON_MALFUNCTIONS,
    name: SideWindowMenuKey.BEACON_MALFUNCTIONS
  },
  MISSIONS: {
    code: SideWindowMenuKey.MISSIONS,
    name: SideWindowMenuKey.MISSIONS
  }
}

export enum AlertAndReportingTab {
  ALERT = 'ALERT',
  REPORTING = 'REPORTING'
}
