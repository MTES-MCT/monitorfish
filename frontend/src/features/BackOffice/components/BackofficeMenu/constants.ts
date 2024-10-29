export enum BackOfficeMenuKey {
  CONTROL_OBJECTIVE_TABLES = 'CONTROL_OBJECTIVE_TABLES',
  FLEET_SEGMENT_TABLE = 'FLEET_SEGMENT_TABLE',
  PRIOR_NOTIFICATION_SUBSCRIBER_TABLE = 'PRIOR_NOTIFICATION_SUBSCRIBER_TABLE',
  REGULATORY_ZONE_TABLE = 'REGULATORY_ZONE_TABLE'
}

export const BACK_OFFICE_MENU_LABEL: Record<BackOfficeMenuKey, string> = {
  [BackOfficeMenuKey.CONTROL_OBJECTIVE_TABLES]: 'Objectifs de contrôle',
  [BackOfficeMenuKey.FLEET_SEGMENT_TABLE]: 'Segments de flotte',
  [BackOfficeMenuKey.PRIOR_NOTIFICATION_SUBSCRIBER_TABLE]: 'Diffusion des préavis',
  [BackOfficeMenuKey.REGULATORY_ZONE_TABLE]: 'Zones réglementaires'
}

export const BackOfficeMenuPath = {
  [BackOfficeMenuKey.CONTROL_OBJECTIVE_TABLES]: 'control_objectives',
  [BackOfficeMenuKey.FLEET_SEGMENT_TABLE]: 'fleet_segments',
  [BackOfficeMenuKey.PRIOR_NOTIFICATION_SUBSCRIBER_TABLE]: 'prior_notification_subscribers',
  [BackOfficeMenuKey.REGULATORY_ZONE_TABLE]: 'regulation',

  NEW_REGULATION_FORM: 'regulation/new',
  PRIOR_NOTIFICATION_SUBSCRIBER_FORM: 'prior_notification_subscribers/:controlUnitId',
  REGULATION_FORM: 'regulation/edit'
}
