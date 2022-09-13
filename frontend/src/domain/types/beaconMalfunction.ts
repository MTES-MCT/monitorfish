import type { Integer } from 'type-fest'

export type BeaconMalfunction = {
  endOfBeaconMalfunctionReason: string
  externalReferenceNumber: string
  flagState: string
  id: number
  internalReferenceNumber: string
  ircs: string
  malfunctionEndDateTime: string | null
  malfunctionStartDateTime: string
  notificationRequested: string
  priority: boolean
  stage: string
  vesselIdentifier: string
  vesselName: string
  vesselStatus: string
  vesselStatusLastModificationDateTime: string
}

export type UpdateBeaconMalfunction = {
  stage: string | null
  vesselStatus: string | null
}

export type BeaconMalfunctionComment = {
  comment: string
  dateTime: string
  id: number
  userType: string
}

export type BeaconMalfunctionAction = {
  beaconMalfunctionId: Integer<number>
  dateTime: string
  id: number
  nextValue: string
  previousValue: string
  propertyName: string
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

export type BeaconMalfunctionCommentInput = {
  comment: string
  userType: string
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
