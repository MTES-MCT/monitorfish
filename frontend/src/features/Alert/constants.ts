export enum PendingAlertValueType {
  MISSING_DEP_ALERT = 'MISSING_DEP_ALERT',
  MISSING_FAR_48_HOURS_ALERT = 'MISSING_FAR_48_HOURS_ALERT',
  MISSING_FAR_ALERT = 'MISSING_FAR_ALERT',
  POSITION_ALERT = 'POSITION_ALERT',
  SUSPICION_OF_UNDER_DECLARATION_ALERT = 'SUSPICION_OF_UNDER_DECLARATION_ALERT'
}

export enum SilencedAlertPeriod {
  CUSTOM = 'CUSTOM',
  ONE_DAY = 'ONE_DAY',
  ONE_HOUR = 'ONE_HOUR',
  ONE_MONTH = 'ONE_MONTH',
  ONE_WEEK = 'ONE_WEEK',
  ONE_YEAR = 'ONE_YEAR',
  SIX_HOURS = 'SIX_HOURS',
  THIS_OCCURRENCE = 'THIS_OCCURRENCE',
  TWELVE_HOURS = 'TWELVE_HOURS',
  TWO_HOURS = 'TWO_HOURS'
}

export enum AdministrativeAreaType {
  DISTANCE_TO_SHORE = 'DISTANCE_TO_SHORE',
  EEZ_AREA = 'EEZ_AREA',
  FAO_AREA = 'FAO_AREA',
  NEAFC_AREA = 'NEAFC_AREA'
}

export const AdministrativeAreaTypeLabel: Record<AdministrativeAreaType, string> = {
  DISTANCE_TO_SHORE: 'Distances à la côte',
  EEZ_AREA: 'Zones ZEE',
  FAO_AREA: 'Zones FAO',
  NEAFC_AREA: 'Zones NEAFC'
}

export enum AdministrativeAreaValueLabel {
  '0-12_MINUS_DE_FISHING_AREA' = '12 milles (sans la ZEE DE)',
  '0-12_MINUS_ES_FISHING_AREA' = '12 milles (sans la ZEE ESP)',
  '0-3' = '3 milles',
  '12_MINUS_BE_AND_NL_FISHING_AREAS' = '12 milles (sans les ZEEs BEL et NLD)',
  '3-6' = 'Entre 3 et 6 milles',
  '6-12' = 'Entre 6 et 12 milles'
}
