declare namespace VesselNS {
  export type FishingActivityShowedOnMap = {
    /** The coordinates of the fishing activity */
    coordinates: string[] | null
    /** The effective date of message */
    date: Date
    /** The operation number for logbook */
    id: string
    /** true if the message was deleted */
    isDeleted: boolean
    /** true id the message was not acknowledged */
    isNotAcknowledged: boolean
    /** The message name */
    name: string
  }

  export type Gear = {
    dimension: number
    gear: string
    mesh: number
  }

  export type SelectedVessel = {
    course: number
    dateTime: string | null
    declaredFishingGears: string[]
    departureDateTime: string | null
    destination: string | null
    district: string
    districtCode: string
    emissionPeriod: number | null
    externalReferenceNumber: string
    flagState: string
    from: string | null
    gauge: number
    gearOnboard: Gear[] | null
    id: number
    imo: string
    internalReferenceNumber: string
    ircs: string
    lastControlDateTime: string | null
    lastControlInfraction: boolean | null
    lastLogbookMessageDateTime: string | null
    latitude: number | null
    length: number
    longitude: number | null
    mmsi: string
    navigationLicenceExpirationDate: string
    operatorEmails: string[]
    operatorName: string
    operatorPhones: string[]
    pinger: boolean
    positionType: string | null
    positions: VesselPosition[]
    postControlComment: number | null
    power: number
    proprietorEmails: string[]
    proprietorName: string
    proprietorPhones: string[]
    registryPort: string
    registryPortLocode: string | null
    registryPortName: string | null
    sailingCategory: string
    sailingType: string
    segments: string[] | null
    speciesOnboard: Species[] | null
    speed: number | null
    totalWeightOnboard: number | null
    tripNumber: number | null
    underCharter: boolean
    vesselEmails: string[]
    vesselName: string
    vesselPhones: string[]
    vesselType: string
    width: number
  }

  export type ShowedVesselTrack = {
    coordinates: string[]
    course: number
    extent: number[]
    isDefaultTrackDepth: boolean
    positions: VesselPosition[]
    toHide: boolean
    toShow: boolean
    toZoom: boolean
    vesselId: string
    vesselIdentity: VesselIdentity
  }

  export type Species = {
    faoZone: string
    gear: string
    species: string
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
    underCharter: boolean
    vesselEmails: string[]
    vesselName: string
    vesselPhones: string[]
    vesselType: string
    width: number
  }

  /**
   * The vessel id : `internalReferenceNumber/externalReferenceNumber/ircs`
   *
   * i.e: "FAK000999999/DONTSINK/CALLME"
   */
  export type VesselId = string

  export type VesselIdentity = {
    externalReferenceNumber: string
    flagState: string
    internalReferenceNumber: string
    ircs: string
    mmsi: string
    vesselIdentifier: string
    vesselName: string
  }

  export type VesselLastPosition = {
    alerts: String[] | null
    course: number
    dateTime: string
    departureDateTime: string
    destination: string
    district: string
    districtCode: string
    emissionPeriod: number
    estimatedCurrentLatitude: number
    estimatedCurrentLongitude: number
    externalReferenceNumber: string
    flagState: string
    from: string
    gearOnboard: Gear[]
    internalReferenceNumber: string
    ircs: string
    isAtPort: boolean
    lastControlDateTime: string
    lastControlInfraction: boolean
    lastLogbookMessageDateTime: string
    latitude: number
    length: number
    longitude: number
    mmsi: string
    positionType: string
    postControlComment: number
    registryPortLocode: string
    registryPortName: string
    reporting: String[]
    segments: string[]
    speciesOnboard: Species[]
    speed: number
    totalWeightOnboard: number
    tripNumber: number
    underCharter: boolean
    vesselIdentifier: string
    vesselName: string
    width: number
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
    CUSTOM: 'CUSTOM'
    LAST_DEPARTURE: 'LAST_DEPARTURE'
    ONE_DAY: 'ONE_DAY'
    ONE_MONTH: 'ONE_MONTH'
    ONE_WEEK: 'ONE_WEEK'
    THREE_DAYS: 'THREE_DAYS'
    THREE_WEEK: 'THREE_WEEK'
    TWELVE_HOURS: 'TWELVE_HOURS'
    TWO_DAYS: 'TWO_DAYS'
    TWO_WEEK: 'TWO_WEEK'
  }

  export type VesselTrackDepthKey = Common.ValueOf<VesselTrackDepth>
}
