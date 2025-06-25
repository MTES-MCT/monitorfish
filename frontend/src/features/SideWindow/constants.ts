export enum SideWindowMenuKey {
  ALERT_LIST_AND_REPORTING_LIST = 'ALERT_LIST_AND_REPORTING_LIST',
  BEACON_MALFUNCTION_BOARD = 'BEACON_MALFUNCTION_BOARD',
  MISSION_FORM = 'MISSION_FORM',
  MISSION_LIST = 'MISSION_LIST',
  PRIOR_NOTIFICATION_LIST = 'PRIOR_NOTIFICATION_LIST',
  VESSEL_GROUP = 'VESSEL_GROUP',
  VESSEL_LIST = 'VESSEL_LIST'
}

export const SideWindowMenuLabel: Record<SideWindowMenuKey, string> = {
  ALERT_LIST_AND_REPORTING_LIST: 'Alertes et signalements',
  BEACON_MALFUNCTION_BOARD: 'Suivi VMS',
  MISSION_FORM: 'Ajouter ou éditer une mission',
  MISSION_LIST: 'Missions et contrôles',
  PRIOR_NOTIFICATION_LIST: 'Préavis de débarquement',
  VESSEL_GROUP: 'Groupes de navires',
  VESSEL_LIST: 'Liste des navires'
}

export const SIDE_WINDOW_EXTERNAL_USER_PATH = [
  SideWindowMenuKey.PRIOR_NOTIFICATION_LIST,
  SideWindowMenuKey.VESSEL_LIST,
  SideWindowMenuKey.VESSEL_GROUP
]

export enum SideWindowStatus {
  BLURRED = 'BLURRED',
  CLOSED = 'CLOSED',
  FOCUSED = 'FOCUSED'
}
