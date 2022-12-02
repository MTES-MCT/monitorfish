// TODO This should be moved to `entities/vessel/types.ts`

import type { ReportingType } from '../../types/reporting'
import type { VesselTrackDepth } from '../vesselTrackDepth'
import type { RiskFactor } from './riskFactor/types'
import type Feature from 'ol/Feature'
import type LineString from 'ol/geom/LineString'
import type Point from 'ol/geom/Point'

/**
 * The vessel composite key/identifier used to identify all vessels
 * by concatenating :
 * - internalReferenceNumber
 * - ircs
 * - externalReferenceNumber
 *
 * The result is :`internalReferenceNumber/ircs/externalReferenceNumber`
 *
 * i.e: "FAK000999999/CALLME/DONTSINK"
 */
export type VesselCompositeIdentifier = string

/**
 * The vessel id number used to identify vessels entered in the NAVPRO French database
 * It is used for :
 * - Controls
 * - Beacons
 *
 * i.e: 20569
 */
export type VesselInternalId = number

export enum VesselIdentifier {
  EXTERNAL_REFERENCE_NUMBER = 'EXTERNAL_REFERENCE_NUMBER',
  INTERNAL_REFERENCE_NUMBER = 'INTERNAL_REFERENCE_NUMBER',
  IRCS = 'IRCS'
}

export type VesselIdentity = {
  // TODO Check that.
  beaconNumber?: number | null
  externalReferenceNumber: string | null
  flagState?: string | null
  internalReferenceNumber: string | null
  ircs: string | null
  mmsi?: string | null
  vesselIdentifier?: VesselIdentifier | null
  vesselInternalId?: VesselInternalId | null
  vesselName?: string | null
}

export type Vessel = {
  beaconNumber: number | null
  declaredFishingGears: string[]
  district: string
  districtCode: string
  externalReferenceNumber: string
  flagState: string
  gauge: number
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
  power: number
  proprietorEmails: string[]
  proprietorName: string
  proprietorPhones: string[]
  registryPort: string
  riskFactor: RiskFactor
  sailingCategory: string
  sailingType: string
  underCharter: boolean
  vesselEmails: string[]
  vesselInternalId: number
  vesselName: string
  vesselPhones: string[]
  vesselType: string
  width: number
}

export type SelectedVessel = VesselEnhancedObject & Vessel

export type AugmentedSelectedVessel = SelectedVessel & {
  hasAlert: boolean
  hasInfractionSuspicion: boolean
}

export type VesselAndPositions = {
  positions: VesselPosition[]
  vessel: Vessel
}

export type VesselLastPosition = {
  alerts: string[] | null
  beaconMalfunctionId: number | null
  beaconNumber?: number | null
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
  reportings: ReportingType[]
  segments: string[]
  speciesOnboard: Species[]
  speed: number
  totalWeightOnboard: number
  tripNumber: number
  underCharter: boolean
  vesselIdentifier: VesselIdentifier
  vesselName: string
  width: number
}

export type VesselPosition = {
  course: number
  dateTime: string
  destination: string | null
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

export type ShowedVesselTrack = {
  coordinates: string[]
  course: number
  extent: number[]
  isDefaultTrackDepth: boolean
  positions: VesselPosition[]
  toHide: boolean
  toShow: boolean
  toZoom: boolean
  vesselCompositeIdentifier: string
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

export type VesselEnhancedLastPositionWebGLObject = {
  coordinates: number[]
  course: number
  filterPreview: number // 0 is False, 1 is True - for WebGL
  hasBeaconMalfunction: boolean
  isAtPort: boolean
  isFiltered: number // 0 is False, 1 is True - for WebGL
  lastPositionSentAt: number
  speed: number
  vesselFeatureId: string
  vesselProperties: VesselEnhancedObject
}

export type VesselEnhancedObject = VesselLastPosition & {
  alerts: string[]
  flagState: string
  fleetSegmentsArray: string[]
  gearsArray: string[]
  hasAlert: boolean
  hasInfractionSuspicion: boolean
  lastControlDateTimeTimestamp: number | string
  reportings: ReportingType[]
  speciesArray: string[]
}
