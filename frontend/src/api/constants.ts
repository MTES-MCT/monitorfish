import { FIVE_MINUTES, ONE_MINUTE, THIRTY_SECONDS } from '../constants'

// import type { RefetchConfigOptions } from '@reduxjs/toolkit/dist/query/core/apiState'
// import type { StartQueryActionCreatorOptions } from '@reduxjs/toolkit/dist/query/core/buildInitiate'
import type { SubscriptionOptions } from '@reduxjs/toolkit/query'

export const RTK_MAX_RETRIES = 2

export const RTK_THIRTY_SECONDS_POLLING_QUERY_OPTIONS: SubscriptionOptions & Partial<any> = {
  pollingInterval: THIRTY_SECONDS,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true
}

export const RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS: SubscriptionOptions & Partial<any> = {
  pollingInterval: ONE_MINUTE,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true
}

export const RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS: SubscriptionOptions & Partial<any> = {
  pollingInterval: FIVE_MINUTES,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true
}

export const RTK_FORCE_REFETCH_QUERY_OPTIONS: any = {
  forceRefetch: true
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NOT_FOUND = 404
}

export enum RtkCacheTagType {
  PriorNotification = 'PriorNotification',
  PriorNotificationTypes = 'PriorNotificationTypes',
  PriorNotifications = 'PriorNotifications',
  PriorNotificationsToVerify = 'PriorNotificationsToVerify',
  Vessel = 'Vessel'
}
