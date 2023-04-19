/* eslint-disable typescript-sort-keys/string-enum */
export enum MissionDateRangeFilter {
  CURRENT_DAY = 'CURRENT_DAY',
  CURRENT_WEEK = 'CURRENT_WEEK',
  CURRENT_MONTH = 'CURRENT_MONTH',
  CURRENT_QUARTER = 'CURRENT_QUARTER',
  CURRENT_YEAR = 'CURRENT_YEAR',
  CUSTOM = 'CUSTOM'
}
export enum MissionDateRangeFilterLabel {
  CURRENT_DAY = 'Aujourd’hui',
  CURRENT_WEEK = 'Semaine en cours',
  CURRENT_MONTH = 'Mois en cours',
  CURRENT_QUARTER = 'Trimestre en cours',
  CURRENT_YEAR = 'Année en cours',
  CUSTOM = 'Période spécifique'
}
/* eslint-enable typescript-sort-keys/string-enum */

export enum MissionFilterType {
  ADMINISTRATION = 'ADMINISTRATION',
  CUSTOM_DATE_RANGE = 'CUSTOM_DATE_RANGE',
  DATE_RANGE = 'DATE_RANGE',
  SOURCE = 'SOURCE',
  STATUS = 'STATUS',
  TYPE = 'TYPE',
  UNIT = 'UNIT'
}

export type FilterValues = Partial<Record<MissionFilterType, any>>
