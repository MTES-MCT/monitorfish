import { ReportingTypeCharacteristics } from '@features/Reporting/types'

export const STATUS_OPTIONS = [
  { label: 'Archivé', value: 'ARCHIVED' },
  { label: 'En cours', value: 'NOT_ARCHIVED' }
]

export const REPORTING_TYPE_OPTIONS = [
  {
    label: ReportingTypeCharacteristics.INFRACTION_SUSPICION.displayName,
    value: ReportingTypeCharacteristics.INFRACTION_SUSPICION.code
  },
  { label: ReportingTypeCharacteristics.OBSERVATION.displayName, value: ReportingTypeCharacteristics.OBSERVATION.code }
]
