// TODO Wrap into a `Reporting` namespace.

import { BaseReportingSchema } from '@features/Reporting/schemas/BaseReportingSchema'
import { DisplayedReportingSchema } from '@features/Reporting/schemas/DisplayedReportingSchema'
import { InfractionSuspicionSchema } from '@features/Reporting/schemas/InfractionSuspicionSchema'
import { ReportingCreationSchema } from '@features/Reporting/schemas/ReportingCreationSchema'
import {
  InfractionSuspicionReportingSchema,
  ObservationReportingSchema,
  PendingAlertReportingSchema,
  ReportingSchema
} from '@features/Reporting/schemas/ReportingSchema'
import {
  ReportingAndOccurrencesSchema,
  ThreatSummarySchema,
  type VesselReportingsSchema
} from '@features/Reporting/schemas/VesselReportingsSchema'
import { ReportingOriginActor } from '@features/Reporting/types/ReportingOriginActor'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { z } from 'zod'

import type { ObservationSchema } from '@features/Reporting/schemas/ObservationSchema'
import type Feature from 'ol/Feature'
import type Point from 'ol/geom/Point'

// TODO Move other types into new `Reporting` namespace.
export namespace Reporting {
  export type Reporting = z.infer<typeof ReportingSchema>
  export type EditableReporting = InfractionSuspicionReporting | ObservationReporting

  export type ReportingFeature = Feature<Point> &
    DisplayedReporting & {
      isHovered: boolean
      isSelected: boolean
    }
}

export type BaseReporting = z.infer<typeof BaseReportingSchema>

export type InfractionSuspicionReporting = z.infer<typeof InfractionSuspicionReportingSchema>
export type ObservationReporting = z.infer<typeof ObservationReportingSchema>
export type PendingAlertReporting = z.infer<typeof PendingAlertReportingSchema>

export type DisplayedReporting = z.infer<typeof DisplayedReportingSchema>
export type ReportingCreation = z.infer<typeof ReportingCreationSchema>

type FormBaseEditedFields = Pick<BaseReporting, 'expirationDate' | 'type'>

export type FormEditedReporting =
  | (Partial<InfractionSuspicion> &
      FormBaseEditedFields & {
        type: ReportingType.INFRACTION_SUSPICION
      })
  | (Partial<Observation> &
      FormBaseEditedFields & {
        type: ReportingType.OBSERVATION
      })

export type VesselReportings = z.infer<typeof VesselReportingsSchema>
export type ThreatSummary = z.infer<typeof ThreatSummarySchema>
export type ReportingAndOccurrences = z.infer<typeof ReportingAndOccurrencesSchema>

export type InfractionSuspicion = z.infer<typeof InfractionSuspicionSchema>
export type Observation = z.infer<typeof ObservationSchema>

type ReportingTypeCharacteristic = {
  // TODO It should be useless now that types are discriminated.
  code: ReportingType
  displayName: string
  // TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
  isInfractionSuspicion: boolean
  name: string
}

export const ReportingTypeCharacteristics: Record<ReportingType, ReportingTypeCharacteristic> = {
  ALERT: {
    code: ReportingType.ALERT,
    displayName: "Suspicion d'infraction (alerte)",
    isInfractionSuspicion: true,
    name: 'ALERTE'
  },
  INFRACTION_SUSPICION: {
    code: ReportingType.INFRACTION_SUSPICION,
    displayName: 'Infraction (suspicion)',
    isInfractionSuspicion: true,
    name: "SUSPICION d'INFRACTION"
  },
  OBSERVATION: {
    code: ReportingType.OBSERVATION,
    displayName: 'Observation',
    isInfractionSuspicion: false,
    name: 'OBSERVATION'
  }
}

/**
 * We keep this order as it define the form option inputs order
 */
/* eslint-disable sort-keys-fix/sort-keys-fix */
export const ReportingOriginActorLabel: Record<ReportingOriginActor, string> = {
  OPS: 'OPS',
  SIP: 'SIP',
  UNIT: 'Unité',
  DML: 'DML',
  DIRM: 'DIRM',
  OTHER: 'Autre'
}
/* eslint-enable sort-keys-fix/sort-keys-fix */

export type ApiSearchFilter = {
  endDate: string | undefined
  isArchived: boolean | undefined
  isIUU: boolean | undefined
  reportingPeriod: ReportingSearchPeriod
  reportingType: ReportingType | undefined
  startDate: string | undefined
}

export enum ReportingSearchPeriod {
  CURRENT_YEAR = 'CURRENT_YEAR',
  CUSTOM = 'CUSTOM',
  LAST_12_MONTHS = 'LAST_12_MONTHS',
  LAST_3_MONTHS = 'LAST_3_MONTHS',
  LAST_MONTH = 'LAST_MONTH',
  LAST_WEEK = 'LAST_WEEK',
  TODAY = 'TODAY'
}
