import { ReportingSearchPeriod } from '@features/Reporting/types'
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
/* eslint-enable sort-keys-fix/sort-keys-fix */
