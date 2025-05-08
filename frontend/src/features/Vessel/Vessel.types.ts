import {
  type DeclaredLogbookSpeciesSchema,
  type VesselGroupSchema,
  type ActiveVesselWithPositionSchema,
  ActiveVesselSchema,
  VesselIdentifier
} from '@features/Vessel/schemas/ActiveVesselSchema'
import { z } from 'zod'

import type { VesselSchema } from '@features/Vessel/schemas/VesselSchema'
import type Feature from 'ol/Feature'
import type LineString from 'ol/geom/LineString'
import type Point from 'ol/geom/Point'

export namespace Vessel {
  export type Vessel = z.infer<typeof VesselSchema>
  export type SelectedVessel = Omit<ActiveVesselWithPosition, 'riskFactor'> & Vessel.Vessel
  export type AugmentedSelectedVessel = SelectedVessel & {
    hasAlert: boolean
    hasInfractionSuspicion: boolean
  }

  export type VesselIdentity = {
    beaconNumber: number | undefined
    districtCode: string | undefined
    externalReferenceNumber: string | undefined
    flagState: string
    internalReferenceNumber: string | undefined
    ircs: string | undefined
    mmsi: string | undefined
    vesselId: VesselId | undefined
    vesselIdentifier: VesselIdentifier | undefined
    vesselLength: number | undefined
    vesselName: string | undefined
  }

  /**
   * The vessel id number used to identify vessels entered in NAVPRO French database
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

  export enum NetworkType {
    CELLULAR = 'CELLULAR',
    SATELLITE = 'SATELLITE'
  }

  export type VesselAndPositions = {
    positions: VesselPosition[]
    vessel: Vessel.Vessel | undefined
  }

  export type DeclaredLogbookSpecies = z.infer<typeof DeclaredLogbookSpeciesSchema>

  export type VesselGroup = z.infer<typeof VesselGroupSchema>

  export type ActiveVesselWithPosition = z.infer<typeof ActiveVesselWithPositionSchema>
  export type ActiveVessel = z.infer<typeof ActiveVesselSchema>

  export type VesselPosition = {
    course: number
    dateTime: string
    destination: string | undefined
    externalReferenceNumber: string | undefined
    flagState: string
    from: string
    internalReferenceNumber: string | undefined
    ircs: string | undefined
    isAtPort: boolean | undefined
    isFishing: boolean | undefined
    isManual: boolean | undefined
    latitude: number
    longitude: number
    mmsi: string | undefined
    networkType: NetworkType | undefined
    positionType: string
    speed: number
    tripNumber: number | undefined
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

  export interface VesselEstimatedPositionFeature extends Feature<Point | LineString> {
    estimatedPosition: {
      dateTime: string
      latitude: number
      longitude: number
    }
  }

  export type VesselLastPositionFeature = Feature<Point> &
    Vessel.ActiveVesselWithPosition & {
      color: string | undefined
      groupsDisplayed: VesselGroup[]
      numberOfGroupsHidden: number
    }

  // ---------------------------------------------------------------------------
  // API

  export type ApiSearchFilter = {
    searched: string
  }
}
