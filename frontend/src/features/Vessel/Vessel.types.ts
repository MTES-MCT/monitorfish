import type { RiskFactor } from '../../domain/entities/vessel/riskFactor/types'

export namespace Vessel {
  export type Vessel = {
    beaconNumber: number | undefined
    declaredFishingGears: string[] | undefined
    district: string | undefined
    districtCode: string | undefined
    externalReferenceNumber: string | undefined
    // TODO What's the value for "Navire inconnu"?
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
    riskFactor: RiskFactor | undefined
    sailingCategory: string | undefined
    sailingType: string | undefined
    underCharter: boolean | undefined
    vesselEmails: string[] | undefined
    vesselId: number | undefined
    vesselName: string | undefined
    vesselPhones: string[] | undefined
    vesselType: string | undefined
    width: number | undefined
  }
}
