import type { RiskFactor } from '../../domain/entities/vessel/riskFactor/types'

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
    riskFactor: RiskFactor | undefined
  }

  // TODO Replace with `| undefined` once API calls use RTK.
  export interface VesselIdentity {
    beaconNumber: number | null
    districtCode: string | null
    externalReferenceNumber: string | null
    flagState: string
    imo: string | null
    internalReferenceNumber: string | null
    ircs: string | null
    length: number | null
    mmsi: string | null
    vesselId: number
    vesselIdentifier: Identifier | null
    vesselName: string | null
  }
  // TODO Replace with `Undefine<VesselIdentity>` once API calls use RTK.
  export type VesselIdentityData = Omit<VesselIdentity, 'vesselId'> & {
    vesselId: number | null
  }

  export enum Identifier {
    EXTERNAL_REFERENCE_NUMBER = 'EXTERNAL_REFERENCE_NUMBER',
    INTERNAL_REFERENCE_NUMBER = 'INTERNAL_REFERENCE_NUMBER',
    IRCS = 'IRCS'
  }
}
