// TODO This should be moved to `entities/vessel/mission.types.ts`

import { ReportingType } from '@features/Reporting/types'

import type { VesselTrackDepth } from '../vesselTrackDepth'
import type { SelectableVesselTrackDepth } from '@features/Vessel/components/VesselSidebar/actions/TrackRequest/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type Feature from 'ol/Feature'
import type LineString from 'ol/geom/LineString'
import type Point from 'ol/geom/Point'

/**
 * The vessel id number used to identify vessels entered in the NAVPRO French database
 * It is used for :
 * - Controls
 * - Beacons
 * - Vessel information
 *
 * i.e: 20569
 */
export type VesselId = number

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
 * The vessel feature id is the vessel composite key concatenated to the `vessel:` string.
 * It is mainly used to distinct OpenLayers objects (called Features)
 *
 * i.e: "vessel:FAK000999999/CALLME/DONTSINK"
 * @see VesselCompositeIdentifier
 */
export type VesselFeatureId = string

export enum VesselIdentifier {
  EXTERNAL_REFERENCE_NUMBER = 'EXTERNAL_REFERENCE_NUMBER',
  INTERNAL_REFERENCE_NUMBER = 'INTERNAL_REFERENCE_NUMBER',
  IRCS = 'IRCS'
}

export enum NetworkType {
  CELLULAR = 'CELLULAR',
  SATELLITE = 'SATELLITE'
}

export type VesselIdentity = {
  beaconNumber?: number | null
  districtCode?: string | null
  externalReferenceNumber: string | null
  flagState: string
  internalReferenceNumber: string | null
  ircs: string | null
  mmsi?: string | null
  vesselId?: VesselId | null
  vesselIdentifier?: VesselIdentifier | null
  vesselName?: string | null
}

export type SelectedVessel = VesselEnhancedObject & Vessel.EnrichedVessel

export type AugmentedSelectedVessel = SelectedVessel & {
  hasAlert: boolean
  hasInfractionSuspicion: boolean
}

export type VesselAndPositions = {
  positions: VesselPosition[]
  vessel: Vessel.EnrichedVessel
}

export type VesselLastPosition = {
  alerts: string[] | null
  beaconMalfunctionId: number | null
  beaconNumber?: number | null
  course: number
  dateTime: string
  departureDateTime: string
  destination: string
  detectabilityRiskFactor: number
  district: string
  districtCode: string
  emissionPeriod: number
  estimatedCurrentLatitude: number
  estimatedCurrentLongitude: number
  externalReferenceNumber: string
  flagState: string
  from: string
  gearOnboard: DeclaredLogbookGear[]
  impactRiskFactor: number
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
  probabilityRiskFactor: number
  registryPortLocode: string
  registryPortName: string
  reportings: ReportingType[]
  riskFactor: number
  segments: string[]
  speciesOnboard: DeclaredLogbookSpecies[]
  speed: number
  totalWeightOnboard: number
  tripNumber: number
  underCharter: boolean
  vesselId: number | null
  vesselIdentifier: VesselIdentifier
  vesselName: string
  width: number
}

export type VesselPosition = {
  course: number
  dateTime: string
  destination: string | null
  externalReferenceNumber: string | null
  flagState: string
  from: string
  internalReferenceNumber: string | null
  ircs: string | null
  isAtPort: boolean | null
  isFishing: boolean | null
  isManual: boolean | null
  latitude: number
  longitude: number
  mmsi: string | null
  networkType: NetworkType | null
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

export type DeclaredLogbookGear = {
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
export type DeclaredLogbookSpecies = {
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
  trackDepth: SelectableVesselTrackDepth
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
  vesselFeatureId: VesselFeatureId
  vesselProperties: VesselEnhancedObject
}

export type VesselLastPositionFeature = Feature<Point> & VesselEnhancedLastPositionWebGLObject

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
