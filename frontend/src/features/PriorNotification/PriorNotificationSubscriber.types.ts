export namespace PriorNotificationSubscriber {
  export interface Subscriber {
    controlUnit: ControlUnit
    /** Control unit ID. */
    id: number
    portSubscriptions: PortSubscription[]
    segmentSubscriptions: SegmentSubscription[]
    vesselSubscriptions: VesselSubscription[]
  }

  /** @internal Only used within this namespace. */
  type Administration = {
    id: number
    name: String
  }

  /** @internal Only used within this namespace. */
  type ControlUnit = {
    administration: Administration
    id: number
    name: String
  }

  export type PortSubscription = {
    controlUnitId: number
    hasSubscribedToAllPriorNotifications: boolean
    portLocode: string
    portName: string | undefined
  }

  export type SegmentSubscription = {
    controlUnitId: number
    hasSubscribedToAllPriorNotifications: boolean
    segmentCode: string
    segmentName: string | undefined
  }

  export type VesselSubscription = {
    controlUnitId: number
    vesselId: number
    vesselName: string | undefined
  }

  export type FormData = {
    controlUnitId: number
    portLocodes: string[]
    portLocodesWithAllNotifications: string[]
    segmentCodes: string[]
    vesselIds: number[]
  }

  export enum ApiSortColumn {
    CONTROL_UNIT_NAME = 'CONTROL_UNIT_NAME'
  }
}
