export enum BackOfficeMenuKey {
  CONTROL_OBJECTIVE_TABLES = 'CONTROL_OBJECTIVE_TABLES',
  FLEET_SEGMENT_TABLE = 'FLEET_SEGMENT_TABLE',
  PRIOR_NOTIFICATION_SUBSCRIBER_TABLE = 'PRIOR_NOTIFICATION_SUBSCRIBER_TABLE',
  PRODUCER_ORGANIZATION_TABLE = 'PRODUCER_ORGANIZATION_TABLE',
  REGULATORY_ZONE_TABLE = 'REGULATORY_ZONE_TABLE'
}

export const BACK_OFFICE_MENU_LABEL: Record<BackOfficeMenuKey, string> = {
  [BackOfficeMenuKey.CONTROL_OBJECTIVE_TABLES]: 'Objectifs de contrôle',
  [BackOfficeMenuKey.FLEET_SEGMENT_TABLE]: 'Segments de flotte',
  [BackOfficeMenuKey.PRIOR_NOTIFICATION_SUBSCRIBER_TABLE]: 'Diffusion des préavis',
  // OP: Organisation de Producteurs
  [BackOfficeMenuKey.PRODUCER_ORGANIZATION_TABLE]: 'Adhésions aux OP',
  [BackOfficeMenuKey.REGULATORY_ZONE_TABLE]: 'Zones réglementaires'
}

export const BackOfficeMenuPath = {
  [BackOfficeMenuKey.CONTROL_OBJECTIVE_TABLES]: 'control_objectives',
  [BackOfficeMenuKey.FLEET_SEGMENT_TABLE]: 'fleet_segments',
  [BackOfficeMenuKey.PRIOR_NOTIFICATION_SUBSCRIBER_TABLE]: 'prior_notification_subscribers',
  [BackOfficeMenuKey.PRODUCER_ORGANIZATION_TABLE]: 'producer_organization_membership',
  [BackOfficeMenuKey.REGULATORY_ZONE_TABLE]: 'regulation',

  NEW_REGULATION_FORM: 'regulation/new',
  PRIOR_NOTIFICATION_SUBSCRIBER_FORM: 'prior_notification_subscribers/:controlUnitId',
  REGULATION_FORM: 'regulation/edit'
}
