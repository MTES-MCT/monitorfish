declare namespace VesselNS {
  export type FishingActivityShowedOnMap = {
    /** The operation number for logbook */
    id: string
    /** The effective date of message */
    date: Date
    /** The message name */
    name: string
    /** The coordinates of the fishing activity */
    coordinates: string[] | null
    /** true if the message was deleted */
    isDeleted: boolean
    /** true id the message was not acknowledged */
    isNotAcknowledged: boolean
  }

  export type Gear = {
    dimension: number
    gear: string
    mesh: number
  }

  export type SelectedVessel = {
    declaredFishingGears: string[]
    district: string
    districtCode: string
    externalReferenceNumber: string
    flagState: string
    gauge: number
    id: number
    imo: string
    internalReferenceNumber: string
    ircs: string
    length: number
    mmsi: string
    navigationLicenceExpirationDate: string
    operatorEmails: string[]
    operatorName: string
    operatorPhones: string[]
    pinger: boolean
    positions: VesselPosition[]
    power: number
    proprietorEmails: string[]
    proprietorName: string
    proprietorPhones: string[]
    registryPort: string
    sailingCategory: string
    sailingType: string
    vesselEmails: string[]
    vesselName: string
    vesselPhones: string[]
    vesselType: string
    width: number
    course: number
    dateTime: string | null
    departureDateTime: string | null
    destination: string | null
    emissionPeriod: number | null
    from: string | null
    gearOnboard: Gear[] | null
    lastLogbookMessageDateTime: string | null
    latitude: number | null
    longitude: number | null
    positionType: string | null
    registryPortLocode: string | null
    registryPortName: string | null
    segments: string[] | null
    speciesOnboard: Species[] | null
    speed: number | null
    totalWeightOnboard: number | null
    tripNumber: number | null
    lastControlDateTime: string | null
    lastControlInfraction: boolean | null
    postControlComment: number | null
    underCharter: boolean
  }

  export type ShowedVesselTrack = {
    vesselId: string
    vesselIdentity: VesselIdentity
    coordinates: string[]
    course: number
    positions: VesselPosition[]
    isDefaultTrackDepth: boolean
    extent: number[]
    toShow: boolean
    toHide: boolean
    toZoom: boolean
  }

  export type Species = {
    species: string
    faoZone: string
    gear: string
    weight: number
  }

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

  export type Vessel = {
    declaredFishingGears: string[]
    district: string
    districtCode: string
    externalReferenceNumber: string
    flagState: string
    gauge: number
    id: number
    imo: string
    internalReferenceNumber: string
    ircs: string
    length: number
    mmsi: string
    navigationLicenceExpirationDate: string
    operatorEmails: string[]
    operatorName: string
    operatorPhones: string[]
    pinger: boolean
    positions: VesselPosition[]
    power: number
    proprietorEmails: string[]
    proprietorName: string
    proprietorPhones: string[]
    registryPort: string
    sailingCategory: string
    sailingType: string
    vesselEmails: string[]
    vesselName: string
    vesselPhones: string[]
    vesselType: string
    width: number
    underCharter: boolean
  }

  /**
   * The vessel id : `internalReferenceNumber/externalReferenceNumber/ircs`
   *
   * i.e: "FAK000999999/DONTSINK/CALLME"
   */
  export type VesselId = string

  export type VesselIdentity = {
    internalReferenceNumber: string
    externalReferenceNumber: string
    ircs: string
    mmsi: string
    flagState: string
    vesselName: string
    vesselIdentifier: string
  }

  export type VesselLastPosition = {
    course: number
    dateTime: string
    departureDateTime: string
    destination: string
    district: string
    districtCode: string
    emissionPeriod: number
    externalReferenceNumber: string
    flagState: string
    from: string
    gearOnboard: Gear[]
    internalReferenceNumber: string
    ircs: string
    lastLogbookMessageDateTime: string
    latitude: number
    length: number
    longitude: number
    mmsi: string
    positionType: string
    registryPortLocode: string
    registryPortName: string
    segments: string[]
    speciesOnboard: Species[]
    speed: number
    totalWeightOnboard: number
    tripNumber: number
    vesselName: string
    width: number
    lastControlDateTime: string
    vesselIdentifier: string
    lastControlInfraction: boolean
    postControlComment: number
    estimatedCurrentLatitude: number
    estimatedCurrentLongitude: number
    isAtPort: boolean
    underCharter: boolean
    alerts: String[] | null
    reporting: String[]
  }

  export type VesselPosition = {
    course: number
    dateTime: string
    destination: string
    externalReferenceNumber: string
    flagState: string
    from: string
    internalReferenceNumber: string
    ircs: string
    latitude: number
    longitude: number
    mmsi: string
    positionType: string
    speed: number
    tripNumber: number
    vesselName: string
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
