/* eslint-disable typescript-sort-keys/string-enum */
export enum MissionDateRangeFilter {
  CURRENT_DAY = 'Aujourd’hui',
  CURRENT_WEEK = 'Semaine en cours',
  CURRENT_MONTH = 'Mois en cours',
  CURRENT_QUARTER = 'Trimestre en cours',
  CUSTOM = 'Période spécifique'
}
/* eslint-enable typescript-sort-keys/string-enum */

export enum MissionFilterType {
  ALERT_TYPE = 'alertType',
  CUSTOM_DATE_RANGE = 'customDateRange',
  DATE_RANGE = 'dateRange',
  INSPECTION_TYPE = 'inspectionType',
  MISSION_TYPE = 'missionType',
  STATUS = 'status',
  UNIT = 'unit'
}

/* eslint-disable typescript-sort-keys/string-enum */
export enum MissionStatus {
  INCOMING = 'À venir',
  IN_PROGRESS = 'En cours',
  DONE = 'Terminée',
  CLOSED = 'Clotûrée'
}
/* eslint-enable typescript-sort-keys/string-enum */
