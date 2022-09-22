import type { ActiveAlert } from './alert'

export type VesselVoyage = {
  endDate: string | null
  isFirstVoyage: boolean
  isLastVoyage: boolean
  logbookMessagesAndAlerts: FishingActivities
  startDate: string | null
  tripNumber: number
}

export type FishingActivities = {
  alerts: ActiveAlert[]
  logbookMessages: LogbookMessage[]
}

export type LogbookMessage = {
  acknowledge: {
    isSuccess: boolean
    rejectionCause: string
    returnStatus: string
  }
  deleted: boolean
  externalReferenceNumber: string
  flagState: string
  imo: string
  integrationDateTime: string
  internalReferenceNumber: string
  ircs: string
  isCorrected: boolean
  isSentByFailoverSoftware: boolean
  message: Object
  messageType: string
  operationDateTime: string
  operationNumber: string
  operationType: string
  rawMessage: string
  referencedReportId: string
  reportDateTime: string
  reportId: string
  tripNumber: number
  vesselName: string
}
