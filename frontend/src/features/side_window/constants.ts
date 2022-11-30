import type { MenuItem } from '../../types'

export enum SideWindowMenuKey {
  ALERTS = 'Alertes',
  BEACON_MALFUNCTIONS = 'Suivi VMS',
  MISSION_FORM = 'Ajouter ou éditer une mission',
  MISSION_LIST = 'Liste des missions et contrôles'
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
  MISSION_FORM: {
    code: SideWindowMenuKey.MISSION_FORM,
    name: SideWindowMenuKey.MISSION_FORM
  },
  MISSION_LIST: {
    code: SideWindowMenuKey.MISSION_LIST,
    name: SideWindowMenuKey.MISSION_LIST
  }
}

export enum AlertAndReportingTab {
  ALERT = 'ALERT',
  REPORTING = 'REPORTING'
}
