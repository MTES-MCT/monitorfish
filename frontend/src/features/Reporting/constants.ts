import { ReportingSearchPeriod, ReportingTypeCharacteristics } from '@features/Reporting/types'
import { ReportingOrigin } from '@features/Reporting/types/ReportingOrigin'
import { getOptionsFromLabelledEnum } from '@mtes-mct/monitor-ui'

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const REPORTING_SEARCH_PERIOD_LABEL: Record<ReportingSearchPeriod, string> = {
  TODAY: 'Aujourd’hui',
  LAST_WEEK: 'Une semaine',
  LAST_MONTH: 'Un mois',
  LAST_3_MONTHS: '3 mois',
  LAST_12_MONTHS: '12 mois',
  CURRENT_YEAR: 'Année en cours',
  CUSTOM: 'Période spécifique'
}
export const REPORTING_SEARCH_PERIOD_AS_OPTIONS = getOptionsFromLabelledEnum(REPORTING_SEARCH_PERIOD_LABEL)

export const REPORTING_ORIGIN_LABEL: Record<ReportingOrigin, string> = {
  [ReportingOrigin.ALERT]: 'Alerte auto.',
  [ReportingOrigin.OPS]: 'Pôle OPS',
  [ReportingOrigin.SIP]: 'Pôle SIP',
  [ReportingOrigin.UNIT]: 'Unité',
  [ReportingOrigin.SATELLITE]: 'Satellite',
  [ReportingOrigin.OTHER]: 'Autre'
}
export const REPORTING_ORIGIN_AS_OPTIONS = getOptionsFromLabelledEnum(REPORTING_ORIGIN_LABEL)
/* eslint-enable sort-keys-fix/sort-keys-fix */

export const STATUS_OPTIONS = [
  { label: 'Archivé', value: 'ARCHIVED' },
  { label: 'En cours', value: 'NOT_ARCHIVED' }
]

export const IUU_OPTIONS = [
  { label: 'Signalement INN', value: 'IUU' },
  { label: 'Signalement non INN', value: 'NOT_IUU' }
]

export const REPORTING_TYPE_OPTIONS = [
  {
    label: ReportingTypeCharacteristics.INFRACTION_SUSPICION.displayName,
    value: ReportingTypeCharacteristics.INFRACTION_SUSPICION.code
  },
  { label: ReportingTypeCharacteristics.OBSERVATION.displayName, value: ReportingTypeCharacteristics.OBSERVATION.code }
]

export const MANUAL_ZONE_LABEL = 'Zone de filtre manuelle'

export const DEFAULT_PAGE_SIZE = 50
