import { ALL_SEAFRONT_GROUP, SeafrontGroup, type AllSeafrontGroup, type NoSeafrontGroup } from '@constants/seafront'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { getOptionsFromLabelledEnum, RichBoolean, type Option } from '@mtes-mct/monitor-ui'

import type { FilterStatus, ListFilter } from './types'

/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
export const SUB_MENU_LABEL: Record<SeafrontGroup | AllSeafrontGroup | NoSeafrontGroup, string> = {
  ALL: 'Tout',
  MED: 'MED',
  MEMN: 'MEMN',
  NAMO: 'NAMO',
  SA: 'SA',
  OUTREMEROA: 'O-M OA',
  OUTREMEROI: 'O-M OI',
  NONE: 'Hors f.'
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
  IN_LESS_THAN_ONE_MONTH = 'IN_LESS_THAN_ONE_MONTH',
  CUSTOM = 'CUSTOM'
}
export const EXPECTED_ARRIVAL_PERIOD_LABEL: Record<ExpectedArrivalPeriod, string> = {
  IN_LESS_THAN_TWO_HOURS: 'Arrivée estimée dans moins de 2h',
  IN_LESS_THAN_FOUR_HOURS: 'Arrivée estimée dans moins de 4h',
  IN_LESS_THAN_EIGTH_HOURS: 'Arrivée estimée dans moins de 8h',
  IN_LESS_THAN_TWELVE_HOURS: 'Arrivée estimée dans moins de 12h',
  IN_LESS_THAN_ONE_DAY: 'Arrivée estimée dans moins de 24h',
  IN_LESS_THAN_ONE_MONTH: 'Arrivée estimée dans moins d’un mois',
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
  specyCodes: undefined,
  statuses: undefined
}

export const DEFAULT_PAGE_SIZE = 10

export const COMMUNITY_PRIOR_NOTIFICATION_TYPES = ['Préavis communautaire', 'Préavis navire tiers']
export const DESIGNATED_PORTS_PRIOR_NOTIFICATION_TYPE_PREFIX = 'Ports désignés'

export const IS_INVALIDATED = 'IS_INVALIDATED'
export const IS_INVALIDATED_LABEL = 'Invalidé'
export const FILTER_STATUSES_AS_OPTIONS: Option<FilterStatus>[] = [
  { label: 'À vérifier (CNSP)', value: PriorNotification.State.PENDING_VERIFICATION },
  { label: 'Hors vérification', value: PriorNotification.State.OUT_OF_VERIFICATION_SCOPE },
  { label: 'Vérifié et diffusé', value: PriorNotification.State.VERIFIED_AND_SENT },
  { label: IS_INVALIDATED_LABEL, value: IS_INVALIDATED },
  { label: 'Envoi auto. demandé', value: PriorNotification.State.AUTO_SEND_REQUESTED },
  { label: 'Envoi auto. fait', value: PriorNotification.State.AUTO_SEND_DONE },
  { label: 'Échec de diffusion', value: PriorNotification.State.FAILED_SEND }
]
