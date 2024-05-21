import { ALL_SEAFRONT_GROUP, SeafrontGroup, type AllSeafrontGroup, type NoSeafrontGroup } from '@constants/seafront'
import { getOptionsFromLabelledEnum, RichBoolean } from '@mtes-mct/monitor-ui'

import type { ListFilter } from './types'

/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
export const SUB_MENU_LABEL: Record<SeafrontGroup | AllSeafrontGroup | NoSeafrontGroup, string> = {
  ALL_SEAFRONT_GROUP: 'TOUT',
  MED: 'MED',
  MEMN: 'MEMN',
  NAMO: 'NAMO',
  SA: 'SA',
  OUTREMEROA: 'O-M OA',
  OUTREMEROI: 'O-M OI',
  NO_SEAFRONT_GROUP: 'HORS'
}
export const SUB_MENUS_AS_OPTIONS = getOptionsFromLabelledEnum(SUB_MENU_LABEL)

export enum LastControlPeriod {
  AFTER_ONE_MONTH_AGO = 'AFTER_ONE_MONTH_AGO',
  BEFORE_ONE_MONTH_AGO = 'BEFORE_ONE_MONTH_AGO',
  BEFORE_ONE_YEAR_AGO = 'BEFORE_ONE_YEAR_AGO',
  BEFORE_SIX_MONTHS_AGO = 'BEFORE_SIX_MONTHS_AGO',
  BEFORE_THREE_MONTHS_AGO = 'BEFORE_THREE_MONTHS_AGO',
  BEFORE_TWO_YEARS_AGO = 'BEFORE_TWO_YEARS_AGO'
}
export const LAST_CONTROL_PERIOD_LABEL: Record<LastControlPeriod, string> = {
  AFTER_ONE_MONTH_AGO: 'Contrôlé il y a moins d’1 mois',
  BEFORE_ONE_MONTH_AGO: 'Contrôlé il y a plus d’1 mois',
  BEFORE_THREE_MONTHS_AGO: 'Contrôlé il y a plus de 3 mois',
  BEFORE_SIX_MONTHS_AGO: 'Contrôlé il y a plus de 6 mois',
  BEFORE_ONE_YEAR_AGO: 'Contrôlé il y a plus d’1 an',
  BEFORE_TWO_YEARS_AGO: 'Contrôlé il y a plus de 2 ans'
}
export const LAST_CONTROL_PERIODS_AS_OPTIONS = getOptionsFromLabelledEnum(LAST_CONTROL_PERIOD_LABEL)

export enum ExpectedArrivalPeriod {
  IN_LESS_THAN_TWO_HOURS = 'IN_LESS_THAN_TWO_HOURS',
  IN_LESS_THAN_FOUR_HOURS = 'IN_LESS_THAN_FOUR_HOURS',
  IN_LESS_THAN_EIGTH_HOURS = 'IN_LESS_THAN_EIGTH_HOURS',
  IN_LESS_THAN_TWELVE_HOURS = 'IN_LESS_THAN_TWELVE_HOURS',
  IN_LESS_THAN_ONE_DAY = 'IN_LESS_THAN_ONE_DAY',
  CUSTOM = 'CUSTOM'
}
export const EXPECTED_ARRIVAL_PERIOD_LABEL: Record<ExpectedArrivalPeriod, string> = {
  IN_LESS_THAN_TWO_HOURS: 'Arrivée estimée dans moins de 2h',
  IN_LESS_THAN_FOUR_HOURS: 'Arrivée estimée dans moins de 4h',
  IN_LESS_THAN_EIGTH_HOURS: 'Arrivée estimée dans moins de 8h',
  IN_LESS_THAN_TWELVE_HOURS: 'Arrivée estimée dans moins de 12h',
  IN_LESS_THAN_ONE_DAY: 'Arrivée estimée dans moins de 24h',
  CUSTOM: 'Période spécifique'
}
export const EXPECTED_ARRIVAL_PERIODS_AS_OPTIONS = getOptionsFromLabelledEnum(EXPECTED_ARRIVAL_PERIOD_LABEL)
/* eslint-enable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */

export const DEFAULT_LIST_FILTER_VALUES: ListFilter = {
  countryCodes: undefined,
  expectedArrivalCustomPeriod: undefined,
  expectedArrivalPeriod: ExpectedArrivalPeriod.IN_LESS_THAN_FOUR_HOURS,
  fleetSegmentSegments: undefined,
  gearCodes: undefined,
  hasOneOrMoreReportings: RichBoolean.BOTH,
  isLessThanTwelveMetersVessel: RichBoolean.BOTH,
  isSent: undefined,
  lastControlPeriod: undefined,
  portLocodes: undefined,
  priorNotificationTypes: undefined,
  seafrontGroup: ALL_SEAFRONT_GROUP,
  searchQuery: undefined,
  specyCodes: undefined
}
