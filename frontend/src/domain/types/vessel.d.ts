declare namespace Vessel {
  export type TrackRequest = TrackRequestCustom | TrackRequestPredefined
  export type TrackRequestCustom = {
    afterDateTime: Date
    beforeDateTime: Date
    trackDepth: 'CUSTOM'
  }
  export type TrackRequestPredefined = {
    afterDateTime: null
    beforeDateTime: null
    trackDepth: Exclude<VesselTrackDepthKey, 'CUSTOM'>
  }

  export type VesselIdentity = {
    internalReferenceNumber: string
    externalReferenceNumber: string
    ircs: string
    mmsi: string
    flagState: string
    vesselName: string
    vesselIdentifier: string
  }

  interface VesselTrackDepth {
    LAST_DEPARTURE: 'LAST_DEPARTURE'
    TWELVE_HOURS: 'TWELVE_HOURS'
    ONE_DAY: 'ONE_DAY'
    TWO_DAYS: 'TWO_DAYS'
    THREE_DAYS: 'THREE_DAYS'
    ONE_WEEK: 'ONE_WEEK'
    TWO_WEEK: 'TWO_WEEK'
    THREE_WEEK: 'THREE_WEEK'
    ONE_MONTH: 'ONE_MONTH'
    CUSTOM: 'CUSTOM'
  }

  export type VesselTrackDepthKey = Common.ValueOf<VesselTrackDepth>
}
