import { FIVE_MINUTES, ONE_MINUTE, THIRTY_SECONDS } from '../constants'

import type { RefetchConfigOptions } from '@reduxjs/toolkit'
import type { StartQueryActionCreatorOptions, SubscriptionOptions } from '@reduxjs/toolkit/query'

export const RTK_MAX_RETRIES = 2

export const RTK_THIRTY_SECONDS_POLLING_QUERY_OPTIONS: SubscriptionOptions & Partial<RefetchConfigOptions> = {
  pollingInterval: THIRTY_SECONDS,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true
}

export const RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS: SubscriptionOptions & Partial<RefetchConfigOptions> = {
  pollingInterval: ONE_MINUTE,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true
}

export const RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS: SubscriptionOptions & Partial<RefetchConfigOptions> = {
  pollingInterval: FIVE_MINUTES,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true
}

export const RTK_FORCE_REFETCH_QUERY_OPTIONS: StartQueryActionCreatorOptions = {
  forceRefetch: true
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NOT_FOUND = 404,
  UNAUTHORIZED = 401
}

export enum RtkCacheTagType {
  PriorNotificationDocuments = 'PriorNotificationDocuments',
  PriorNotificationSubscribers = 'PriorNotificationSubscribers',
  PriorNotificationTypes = 'PriorNotificationTypes',
  PriorNotifications = 'PriorNotifications',
  PriorNotificationsToVerify = 'PriorNotificationsToVerify',
  Reportings = 'Reportings',
  Vessel = 'Vessel'
}

export enum WindowContext {
  MainWindow = 'MainWindow',
  SideWindow = 'SideWindow'
}
