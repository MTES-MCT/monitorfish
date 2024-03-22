import { RichBoolean } from '@mtes-mct/monitor-ui'

import { ExpectedArrivalPeriod } from './components/PriorNotificationList/constants'
import { SeaFrontGroup } from '../../domain/entities/seaFront/constants'

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
  seaFrontGroup: SeaFrontGroup.ALL,
  searchQuery: undefined,
  specyCodes: undefined
}
