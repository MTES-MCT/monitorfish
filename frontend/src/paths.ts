import { BackOfficeMenuKey, BackOfficeMenuPath } from '@features/BackOffice/components/BackofficeMenu/constants'

export const ROUTER_PATHS = {
  activityVisualization: '/activity_visualization',
  backendForFrontend: '/bff',
  backoffice: '/backoffice',
  controlObjectives: BackOfficeMenuPath[BackOfficeMenuKey.CONTROL_OBJECTIVE_TABLES],
  editPriorNotificationSubscriber: BackOfficeMenuPath.PRIOR_NOTIFICATION_SUBSCRIBER_FORM,
  editRegulation: BackOfficeMenuPath.REGULATION_FORM,
  ext: '/ext',
  fleetSegments: BackOfficeMenuPath[BackOfficeMenuKey.FLEET_SEGMENT_TABLE],
  home: '/',
  light: '/light',
  loadLight: '/load_light',
  login: '/log_in',
  newRegulation: BackOfficeMenuPath.NEW_REGULATION_FORM,
  priorNotificationSubscribers: BackOfficeMenuPath[BackOfficeMenuKey.PRIOR_NOTIFICATION_SUBSCRIBER_TABLE],
  producerOrganizationMembership: BackOfficeMenuPath[BackOfficeMenuKey.PRODUCER_ORGANIZATION_TABLE],
  register: '/register',
  regulations: BackOfficeMenuPath[BackOfficeMenuKey.REGULATORY_ZONE_TABLE],
  sideWindow: '/side_window'
}
