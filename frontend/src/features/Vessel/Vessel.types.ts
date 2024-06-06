import type { RiskFactor } from '../../domain/entities/vessel/riskFactor/types'

export namespace Vessel {
  export type Beacon = {
    beaconNumber: string
    isCoastal: string | undefined
    loggingDatetimeUtc: string | undefined
  }

  // TODO Finish typing this type.
  // TODO Rename to `Vessel` once the other `Vessel` type is renamed to something else.
  export type NextVessel = {
    beaconNumber: undefined
    declaredFishingGears: undefined
    district: undefined
    districtCode: undefined
    externalReferenceNumber: string | undefined
    flagState: string
    gauge: undefined
    imo: undefined
    internalReferenceNumber: string | undefined
    ircs: string | undefined
    length: number
    mmsi: string | undefined
    navigationLicenceExpirationDate: undefined
    operatorEmail: undefined
    operatorName: undefined
    operatorPhones: undefined
    pinger: undefined
    power: undefined
    proprietorEmails: undefined
    proprietorName: undefined
    proprietorPhones: undefined
    registryPort: undefined
    riskFactor: undefined
    sailingCategory: undefined
    sailingType: undefined
    underCharter: boolean
    vesselEmails: undefined
    /** ID. */
    vesselId: number
    vesselName: string
    vesselPhones: undefined
    vesselType: undefined
    width: undefined
  }

  // TODO Rename that to something else, it's not "just" a vessel
  export type Vessel = {
    beacon: Beacon
    declaredFishingGears: string[] | undefined
    district: string | undefined
    districtCode: string | undefined
    externalReferenceNumber: string | undefined
    flagState: string
    gauge: number | undefined
    hasLogbookEsacapt: boolean
    hasVisioCaptures: boolean | undefined
    imo: string | undefined
    internalReferenceNumber: string | undefined
    ircs: string | undefined
    length: number | undefined
    logbookEquipmentStatus: string | undefined
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
