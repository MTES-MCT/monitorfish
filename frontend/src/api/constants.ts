import { FIVE_MINUTES, ONE_MINUTE, THIRTY_SECONDS } from '../constants'

import type { RefetchConfigOptions } from '@reduxjs/toolkit'
import type { StartQueryActionCreatorOptions, SubscriptionOptions } from '@reduxjs/toolkit/query'

export const RTK_MAX_RETRIES = 1

export const RTK_DEFAULT_REFETCH_QUERY_OPTIONS: Partial<RefetchConfigOptions> = {
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true
}

export const RTK_THIRTY_SECONDS_POLLING_QUERY_OPTIONS: SubscriptionOptions & Partial<RefetchConfigOptions> = {
  ...RTK_DEFAULT_REFETCH_QUERY_OPTIONS,
  pollingInterval: THIRTY_SECONDS
}

export const RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS: SubscriptionOptions & Partial<RefetchConfigOptions> = {
  ...RTK_DEFAULT_REFETCH_QUERY_OPTIONS,
  pollingInterval: ONE_MINUTE
}

export const RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS: SubscriptionOptions & Partial<RefetchConfigOptions> = {
  ...RTK_DEFAULT_REFETCH_QUERY_OPTIONS,
  pollingInterval: FIVE_MINUTES
}

export const RTK_FORCE_REFETCH_QUERY_OPTIONS: StartQueryActionCreatorOptions = {
  forceRefetch: true
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NOT_FOUND = 404,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403
}

export enum RtkCacheTagType {
  PriorNotificationDocuments = 'PriorNotificationDocuments',
  PriorNotificationSubscribers = 'PriorNotificationSubscribers',
  PriorNotificationTypes = 'PriorNotificationTypes',
  PriorNotifications = 'PriorNotifications',
  PriorNotificationsToVerify = 'PriorNotificationsToVerify',
  ProducerOrganizationMemberships = 'ProducerOrganizationMemberships',
  Reportings = 'Reportings',
  SelectedVessel = 'SelectedVessel',
  Vessel = 'Vessel',
  VesselGroups = 'VesselGroups'
}

export enum WindowContext {
  BackOffice = 'BackOffice',
  MainWindow = 'MainWindow',
  SideWindow = 'SideWindow'
}
