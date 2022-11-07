// TODO This should be moved to `entities/vessel/types.ts`

import type { VesselTrackDepth } from '../vesselTrackDepth'
import type Feature from 'ol/Feature'
import type LineString from 'ol/geom/LineString'
import type Point from 'ol/geom/Point'

export type FishingActivityShowedOnMap = {
  /** The coordinates of the fishing activity */
  coordinates?: string[]
  /** The effective date of message */
  date: string
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
  beaconNumber: number | undefined
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
  name: string
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
  vesselIdentifier: string
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

// TODO Exist both in Vessel and Species.
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
  trackDepth: VesselTrackDepth.CUSTOM
}
export type TrackRequestPredefined = {
  afterDateTime: null
  beforeDateTime: null
  trackDepth: Exclude<VesselTrackDepth, 'CUSTOM'>
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
  // TODO Check that.
  beaconNumber?: number | undefined
  externalReferenceNumber: string | undefined
  flagState: string | undefined
  internalReferenceNumber: string | undefined
  ircs: string | undefined
  mmsi: string | undefined
  vesselId?: number | undefined
  vesselIdentifier: string | undefined
  vesselName: string | undefined
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
  isFishing: boolean | null
  isManual: boolean | null
  latitude: number
  longitude: number
  mmsi: string | null
  positionType: string
  speed: number
  tripNumber: number | null
  vesselName: string
}

export interface VesselPointFeature extends Feature<Point> {
  course?: number
  dateTime?: string
  name?: string
  positionType?: string
  speed?: number
}

export interface VesselLineFeature extends Feature<LineString> {
  course?: number
  dateTime?: string
  firstPositionDate?: Date
  isTimeEllipsis?: boolean
  positionType?: string
  secondPositionDate?: Date
  speed?: number
  trackType?: TrackTypeRecordItem
}

export interface VesselArrowFeature extends Feature<Point> {
  course?: number
  name?: string
}

export type TrackTypeRecordItem = {
  arrow: string
  code: string
  color: string
  description: string
}
