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
    logbookSoftware: string | undefined
    riskFactor: RiskFactor | undefined
  }
}
