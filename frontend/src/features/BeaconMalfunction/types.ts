import type {
  BeaconMalfunctionPropertyName,
  BeaconMalfunctionsStage,
  BeaconMalfunctionVesselStatus,
  EndOfBeaconMalfunctionReason
} from './constants'
import type { VesselIdentity } from '../../domain/entities/vessel/types'
import type { BeaconMalfunctionDetailsType } from '@features/BeaconMalfunction/components/BeaconMalfunctionBoard/utils'
import type { Integer } from 'type-fest'

export type BeaconMalfunction = {
  endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason
  externalReferenceNumber: string
  flagState: string
  id: number
  internalReferenceNumber: string
  ircs: string
  malfunctionEndDateTime: string | null
  malfunctionStartDateTime: string
  notificationRequested: string | null
  stage: string
  vesselIdentifier: string
  vesselName: string
  vesselStatus: BeaconMalfunctionVesselStatus
  vesselStatusLastModificationDateTime: string
}

export type UpdateBeaconMalfunction = {
  stage: BeaconMalfunctionsStage | null
  vesselStatus: BeaconMalfunctionVesselStatus | null
}

export type BeaconMalfunctionComment = {
  comment: string
  dateTime: string
  id: number
  userType: string
}

export type BeaconMalfunctionAction = {
  beaconMalfunctionId: number
  dateTime: string
  nextValue: BeaconMalfunctionsStage | BeaconMalfunctionVesselStatus
  previousValue: BeaconMalfunctionsStage | BeaconMalfunctionVesselStatus
  propertyName: BeaconMalfunctionPropertyName
}

export type BeaconMalfunctionFollowUpItem = (
  | BeaconMalfunctionAction
  | BeaconMalfunctionComment
  | BeaconMalfunctionNotification
) & {
  isBeaconCreationMessage?: boolean
  type: BeaconMalfunctionDetailsType
}

export type BeaconMalfunctionNotification = {
  beaconMalfunctionId: Integer<number>
  communicationMeans: string
  dateTime: string
  errorMessage: string | null
  id: number
  notificationType: string
  recipientAddressOrNumber: string
  recipientFunction: string
  recipientName: string
  success: boolean | null
}

export type BeaconMalfunctionNotifications = {
  beaconMalfunctionId: Integer<number>
  dateTimeUtc: string
  notificationType: string
  notifications: BeaconMalfunctionNotification[]
}

export type BeaconMalfunctionResumeAndDetails = {
  actions: BeaconMalfunctionAction[]
  beaconMalfunction: BeaconMalfunction
  comments: BeaconMalfunctionComment[]
  notifications: BeaconMalfunctionNotifications[]
  resume: VesselBeaconMalfunctionsResume
}

export type VesselBeaconMalfunctionsResumeAndHistory = {
  current: BeaconMalfunctionResumeAndDetails | null
  history: BeaconMalfunctionResumeAndDetails[]
  resume: VesselBeaconMalfunctionsResume
  vesselIdentity: VesselIdentity
}

export type VesselBeaconMalfunctionsResume = {
  lastBeaconMalfunctionDateTime: string | null
  lastBeaconMalfunctionVesselStatus: string | null
  numberOfBeaconsAtPort: number
  numberOfBeaconsAtSea: number
}

export type BeaconMalfunctionStageColumnValue = {
  code: string
  description?: string
  index: number | undefined
  isColumn: boolean
  title: string
}

export type BeaconMalfunctionStatusValue = {
  color: string
  hoursOffsetToRetrieveMalfunctionCreation: number | undefined
  icon: JSX.Element
  label: string
  textColor: string
  value: BeaconMalfunctionVesselStatus
}

export type EnfOfBeaconMalfunctionStatusValue = {
  color: string
  label: string
  textColor: string
  value: string
}
