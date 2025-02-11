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

export enum InfractionFilter {
  WITHOUT_INFRACTIONS,
  INFRACTION_WITH_RECORD,
  INFRACTION_WITHOUT_RECORD
}

export enum InfractionFilterLabel {
  WITHOUT_INFRACTIONS = 'Sans infraction',
  INFRACTION_WITH_RECORD = 'Avec infraction et PV',
  INFRACTION_WITHOUT_RECORD = 'Avec infraction sans PV'
}
/* eslint-enable typescript-sort-keys/string-enum */

export enum MissionFilterType {
  ADMINISTRATION = 'ADMINISTRATION',
  COMPLETION_STATUS = 'COMPLETION_STATUS',
  CUSTOM_DATE_RANGE = 'CUSTOM_DATE_RANGE',
  DATE_RANGE = 'DATE_RANGE',
  INFRACTIONS = 'INFRACTIONS',
  STATUS = 'STATUS',
  TYPE = 'TYPE',
  UNDER_JDP = 'UNDER_JDP',
  UNIT = 'UNIT',
  WITH_ACTIONS = 'WITH_ACTIONS'
}

export type FilterValues = Partial<Record<MissionFilterType, any>>
