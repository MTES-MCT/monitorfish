export enum BackOfficeMenuKey {
  CONTROL_OBJECTIVE_LIST = 'CONTROL_OBJECTIVE_LIST',
  FLEET_SEGMENT_LIST = 'CONTROL_UNIT_LIST',
  REGULATORY_ZONE_LIST = 'REGULATORY_ZONE_LIST'
}

export const BACK_OFFICE_MENU_LABEL: Record<BackOfficeMenuKey, string> = {
  [BackOfficeMenuKey.CONTROL_OBJECTIVE_LIST]: 'Objectifs de contrôle',
  [BackOfficeMenuKey.FLEET_SEGMENT_LIST]: 'Segments de flotte',
  [BackOfficeMenuKey.REGULATORY_ZONE_LIST]: 'Zones réglementaires'
}

export const BACK_OFFICE_MENU_PATH: Record<BackOfficeMenuKey, string> = {
  [BackOfficeMenuKey.CONTROL_OBJECTIVE_LIST]: '/control_objectives',
  [BackOfficeMenuKey.FLEET_SEGMENT_LIST]: '/fleet_segments',
  [BackOfficeMenuKey.REGULATORY_ZONE_LIST]: '/regulation'
}
