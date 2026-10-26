import type { LegacyControlUnit } from '@features/ControlUnit/legacyControlUnit'

/**
 * Contrôle croisé fetched from RapportNav
 */
export namespace Inquiry {
  export interface Inquiry {
    conclusion: InquiryConclusion | undefined
    controlUnits: LegacyControlUnit.LegacyControlUnit[]
    endDateTimeUtc: string | undefined
    id: string
    infractions: InquiryInfraction[]
    isSignedByInspector: boolean | undefined
    missionId: number | undefined
    observations: string[]
    origin: InquiryOrigin | undefined
    service: InquiryService | undefined
    startDateTimeUtc: string | undefined
    status: InquiryStatus | undefined
    type: string | undefined
    vesselId: number | undefined
  }

  export interface InquiryService {
    controlUnitIds: number[]
    id: number
    name: string | undefined
  }

  export interface InquiryInfraction {
    controlType: InquiryControlType | undefined
    infractionType: InquiryInfractionType | undefined
    natinfs: string[]
    observations: string | undefined
  }

  export enum InquiryOrigin {
    CNSP_REPORTING = 'CNSP_REPORTING',
    FOLLOW_UP_CONTROL = 'FOLLOW_UP_CONTROL',
    OPPORTUNITY_CONTROL = 'OPPORTUNITY_CONTROL',
    OTHER_REPORTING = 'OTHER_REPORTING',
    URCEM_DEDICATED_STATION = 'URCEM_DEDICATED_STATION'
  }

  export enum InquiryStatus {
    CLOSED = 'CLOSED',
    IN_PROGRESS = 'IN_PROGRESS'
  }

  export enum InquiryConclusion {
    NO_FOLLOW_UP = 'NO_FOLLOW_UP',
    WITH_REPORT = 'WITH_REPORT'
  }

  export enum InquiryControlType {
    ADMINISTRATIVE = 'ADMINISTRATIVE',
    FISHING_REPORTING_OBLIGATION = 'FISHING_REPORTING_OBLIGATION',
    GENS_DE_MER = 'GENS_DE_MER',
    INN_ACTIVITY = 'INN_ACTIVITY',
    LANDING_OBLIGATION = 'LANDING_OBLIGATION',
    NAVIGATION = 'NAVIGATION',
    OTHER = 'OTHER',
    SECTOR = 'SECTOR',
    SECURITY = 'SECURITY',
    TECHNICAL_MEASURE = 'TECHNICAL_MEASURE',
    TRANSPORT = 'TRANSPORT'
  }

  export enum InquiryInfractionType {
    WAITING = 'WAITING',
    WITHOUT_REPORT = 'WITHOUT_REPORT',
    WITH_REPORT = 'WITH_REPORT'
  }
}
