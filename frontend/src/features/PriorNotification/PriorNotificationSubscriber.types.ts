export namespace PriorNotificationSubscriber {
  export interface Subscriber {
    controlUnit: ControlUnit
    fleetSegmentSubscriptions: FleetSegmentSubscription[]
    portSubscriptions: PortSubscription[]
    vesselSubscriptions: VesselSubscription[]
  }

  /** @internal Only used within this namespace. */
  type Administration = {
    id: number
    name: string
  }

  /** @internal Only used within this namespace. */
  type ControlUnit = {
    administration: Administration
    id: number
    name: string
  }

  export type FleetSegmentSubscription = {
    controlUnitId: number
    segmentCode: string
    segmentName: string | undefined
  }

  export type PortSubscription = {
    controlUnitId: number
    hasSubscribedToAllPriorNotifications: boolean
    portLocode: string
    portName: string | undefined
  }

  export type VesselSubscription = {
    controlUnitId: number
    vesselCallSign: string | undefined
    vesselCfr: string | undefined
    vesselExternalMarking: string | undefined
    vesselId: number
    vesselMmsi: string | undefined
    vesselName: string | undefined
  }

  export type FormData = {
    controlUnitId: number
    fleetSegmentCodes: string[]
    portLocodes: string[]
    portLocodesWithFullSubscription: string[]
    vesselIds: number[]
  }

  // ---------------------------------------------------------------------------
  // API

  export type ApiListFilter = {
    administrationId: number | undefined
    portLocode: string | undefined
    searchQuery: string | undefined
    withAtLeastOneSubscription: boolean | undefined
  }

  export enum ApiListSortColumn {
    CONTROL_UNIT_NAME = 'CONTROL_UNIT_NAME'
  }
}
