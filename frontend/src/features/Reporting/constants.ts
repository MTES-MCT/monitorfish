import { ReportingSearchPeriod } from '@features/Reporting/types'
import { getOptionsFromLabelledEnum } from '@mtes-mct/monitor-ui'

export const REPORTING_SEARCH_PERIOD_LABEL: Record<ReportingSearchPeriod, string> = {
  CURRENT_YEAR: 'Année en cours',
  CUSTOM: 'Période spécifique',
  LAST_12_MONTHS: '12 mois',
  LAST_3_MONTHS: '3 mois',
  LAST_MONTH: 'Un mois',
  LAST_WEEK: 'Une semaine',
  TODAY: 'Aujourd’hui'
}
export const REPORTING_SEARCH_PERIOD_AS_OPTIONS = getOptionsFromLabelledEnum(REPORTING_SEARCH_PERIOD_LABEL)
