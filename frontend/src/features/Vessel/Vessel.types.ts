import type { ProducerOrganizationMembership } from '@features/ProducerOrganizationMembership/types'
import type { RiskFactor } from 'domain/entities/vessel/riskFactor/types'
import type { VesselId, VesselIdentifier, VesselLastPosition } from 'domain/entities/vessel/types'

export namespace Vessel {
  export type Beacon = {
    beaconNumber: string
    isCoastal: string | undefined
    loggingDatetimeUtc: string | undefined
  }

  export interface Vessel {
    declaredFishingGears: string[] | undefined
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

  export type VesselEnhancedObject = VesselLastPosition & {
    fleetSegmentsArray: string[]
    gearsArray: string[]
    hasAlert: boolean
    hasInfractionSuspicion: boolean
    lastControlDateTimeTimestamp: number | string
    speciesArray: string[]
  }

  export type SelectedVessel = VesselEnhancedObject & Vessel.EnrichedVessel
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

  // ---------------------------------------------------------------------------
  // API

  export type ApiSearchFilter = {
    searched: string
  }
}
