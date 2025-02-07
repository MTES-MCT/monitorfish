import { z } from 'zod'

import { numberOrUndefined, stringOrUndefined } from '../../types'

import type { ProducerOrganizationMembership } from '@features/ProducerOrganizationMembership/types'
import type { RiskFactor } from '@features/RiskFactor/types'
import type { VesselLastPositionLightSchema } from '@features/Vessel/schemas/VesselLastPositionLightSchema'
import type { VesselLastPositionSchema } from '@features/Vessel/schemas/VesselLastPositionSchema'
import type Feature from 'ol/Feature'
import type LineString from 'ol/geom/LineString'
import type Point from 'ol/geom/Point'

export namespace Vessel {
  export type Beacon = {
    beaconNumber: string
    isCoastal: string | undefined
    loggingDatetimeUtc: string | undefined
  }

  export interface Vessel {
    declaredFishingGears: string[]
    district: string | undefined
    districtCode: string | undefined
    externalReferenceNumber: string | undefined
    flagState: string
    gauge: number | undefined
    imo: string | undefined
    internalReferenceNumber: string | undefined
    ircs: string | undefined
    length: number | undefined
    mmsi: string | undefined
    navigationLicenceExpirationDate: string | undefined
    navigationLicenceExtensionDate: string | undefined
    navigationLicenceStatus: string | undefined
    operatorEmails: string[] | undefined
    operatorName: string | undefined
    operatorPhones: string[] | undefined
    pinger: boolean | undefined
    power: number | undefined
    proprietorEmails: string[] | undefined
    proprietorName: string | undefined
    proprietorPhones: string[] | undefined
    registryPort: string | undefined
    sailingCategory: string | undefined
    sailingType: string | undefined
    underCharter: boolean | undefined
    vesselEmails: string[] | undefined
    /** ID. */
    vesselId: number | undefined
    vesselName: string | undefined
    vesselPhones: string[] | undefined
    vesselType: string | undefined
    width: number | undefined
  }

  export interface EnrichedVessel extends Vessel {
    beacon: Beacon | undefined
    hasLogbookEsacapt: boolean
    hasVisioCaptures: boolean | undefined
    logbookEquipmentStatus: string | undefined
    logbookSoftware: string | undefined
    producerOrganization: ProducerOrganizationMembership | undefined
    riskFactor: RiskFactor | undefined
  }

  export type SelectedVessel = Omit<VesselLastPosition, 'riskFactor'> & Vessel.EnrichedVessel
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

  export enum VesselIdentifier {
    EXTERNAL_REFERENCE_NUMBER = 'EXTERNAL_REFERENCE_NUMBER',
    INTERNAL_REFERENCE_NUMBER = 'INTERNAL_REFERENCE_NUMBER',
    IRCS = 'IRCS'
  }

  export enum NetworkType {
    CELLULAR = 'CELLULAR',
    SATELLITE = 'SATELLITE'
  }

  export type VesselAndPositions = {
    positions: VesselPosition[]
    vessel: Vessel.EnrichedVessel
  }

  export const DeclaredLogbookGearSchema = z.strictObject({
    dimensions: stringOrUndefined,
    gear: stringOrUndefined,
    mesh: numberOrUndefined
  })

  export const DeclaredLogbookSpeciesSchema = z.strictObject({
    faoZone: z.string(),
    gear: z.string(),
    species: z.string(),
    weight: numberOrUndefined
  })
  export type DeclaredLogbookSpecies = z.infer<typeof DeclaredLogbookSpeciesSchema>

  export type VesselLastPosition = z.infer<typeof VesselLastPositionSchema>
  export type VesselLightLastPosition = z.infer<typeof VesselLastPositionLightSchema>

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

  export type VesselLastPositionFeature = Feature<Point> & Vessel.VesselLastPosition

  // ---------------------------------------------------------------------------
  // API

  export type ApiSearchFilter = {
    searched: string
  }
}
