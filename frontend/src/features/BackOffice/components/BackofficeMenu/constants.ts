import { Icon } from '@mtes-mct/monitor-ui'

import type { IconProps } from '@mtes-mct/monitor-ui'
import type { FunctionComponent } from 'react'

export enum BackOfficeMenuKey {
  CONTROL_OBJECTIVE_TABLES = 'CONTROL_OBJECTIVE_TABLES',
  FLEET_SEGMENT_TABLE = 'FLEET_SEGMENT_TABLE',
  PRIOR_NOTIFICATION_SUBSCRIBER_TABLE = 'PRIOR_NOTIFICATION_SUBSCRIBER_TABLE',
  PRODUCER_ORGANIZATION_TABLE = 'PRODUCER_ORGANIZATION_TABLE',
  REGULATORY_ZONE_TABLE = 'REGULATORY_ZONE_TABLE',
  USER_TABLE = 'USER_TABLE'
}

export const BACK_OFFICE_MENU_LABEL: Record<BackOfficeMenuKey, string> = {
  [BackOfficeMenuKey.CONTROL_OBJECTIVE_TABLES]: 'Objectifs de contrôle',
  [BackOfficeMenuKey.FLEET_SEGMENT_TABLE]: 'Segments de flotte',
  [BackOfficeMenuKey.PRIOR_NOTIFICATION_SUBSCRIBER_TABLE]: 'Diffusion des préavis',
  // OP: Organisation de Producteurs
  [BackOfficeMenuKey.PRODUCER_ORGANIZATION_TABLE]: 'Adhésions aux OP',
  [BackOfficeMenuKey.REGULATORY_ZONE_TABLE]: 'Zones réglementaires',
  [BackOfficeMenuKey.USER_TABLE]: 'Utilisateurs'
}

export const BackOfficeMenuPath = {
  [BackOfficeMenuKey.CONTROL_OBJECTIVE_TABLES]: 'control_objectives',
  [BackOfficeMenuKey.FLEET_SEGMENT_TABLE]: 'fleet_segments',
  [BackOfficeMenuKey.PRIOR_NOTIFICATION_SUBSCRIBER_TABLE]: 'prior_notification_subscribers',
  [BackOfficeMenuKey.PRODUCER_ORGANIZATION_TABLE]: 'producer_organization_membership',
  [BackOfficeMenuKey.REGULATORY_ZONE_TABLE]: 'regulation',
  [BackOfficeMenuKey.USER_TABLE]: 'users',

  NEW_REGULATION_FORM: 'regulation/new',
  PRIOR_NOTIFICATION_SUBSCRIBER_FORM: 'prior_notification_subscribers/:controlUnitId',
  REGULATION_FORM: 'regulation/edit'
}

export type BackOfficeMenuItem = {
  Icon: FunctionComponent<IconProps>
  isAdministratorOnly: boolean
  key: BackOfficeMenuKey
}

export const BACK_OFFICE_MENU_ITEMS: BackOfficeMenuItem[] = [
  { Icon: Icon.MapLayers, isAdministratorOnly: false, key: BackOfficeMenuKey.REGULATORY_ZONE_TABLE },
  { Icon: Icon.ControlUnit, isAdministratorOnly: false, key: BackOfficeMenuKey.CONTROL_OBJECTIVE_TABLES },
  { Icon: Icon.FleetSegment, isAdministratorOnly: false, key: BackOfficeMenuKey.FLEET_SEGMENT_TABLE },
  { Icon: Icon.Fishery, isAdministratorOnly: false, key: BackOfficeMenuKey.PRIOR_NOTIFICATION_SUBSCRIBER_TABLE },
  { Icon: Icon.Account, isAdministratorOnly: false, key: BackOfficeMenuKey.PRODUCER_ORGANIZATION_TABLE },
  { Icon: Icon.GroupPerson, isAdministratorOnly: true, key: BackOfficeMenuKey.USER_TABLE }
]
