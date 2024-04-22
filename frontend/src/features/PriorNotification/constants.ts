import { ALL_SEA_FRONT_GROUP } from '@constants/seaFront'
import { RichBoolean } from '@mtes-mct/monitor-ui'

import { ExpectedArrivalPeriod } from './components/PriorNotificationList/constants'

import type { ListFilter } from './components/PriorNotificationList/types'

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
  seaFrontGroup: ALL_SEA_FRONT_GROUP,
  searchQuery: undefined,
  specyCodes: undefined
}
