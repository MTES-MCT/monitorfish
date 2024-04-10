/* eslint-disable typescript-sort-keys/string-enum */
export enum MissionDateRangeFilter {
  CURRENT_DAY = 'CURRENT_DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  CUSTOM = 'CUSTOM'
}
export enum MissionDateRangeFilterLabel {
  CURRENT_DAY = 'Aujourd’hui',
  WEEK = 'Une semaine',
  MONTH = 'Un mois',
  CUSTOM = 'Période spécifique'
}
/* eslint-enable typescript-sort-keys/string-enum */

export enum MissionFilterType {
  ADMINISTRATION = 'ADMINISTRATION',
  COMPLETION_STATUS = 'COMPLETION_STATUS',
  CUSTOM_DATE_RANGE = 'CUSTOM_DATE_RANGE',
  DATE_RANGE = 'DATE_RANGE',
  STATUS = 'STATUS',
  TYPE = 'TYPE',
  UNIT = 'UNIT',
  WITH_ACTIONS = 'WITH_ACTIONS'
}

export type FilterValues = Partial<Record<MissionFilterType, any>>
