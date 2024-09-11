import {
  type LastControlPeriod,
  type ExpectedArrivalPeriod,
  type IS_INVALIDATED,
  IS_PRIOR_NOTIFICATION_ZERO
} from './constants'

import type { AllSeafrontGroup, NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import type { DateAsStringRange, RichBoolean, UndefineExcept } from '@mtes-mct/monitor-ui'

export type ListFilter = UndefineExcept<
  {
    countryCodes: string[]
    expectedArrivalCustomPeriod: DateAsStringRange
    // TODO -5 days for operationDateTime to limit SQL query.
    expectedArrivalPeriod: ExpectedArrivalPeriod
    fleetSegmentSegments: string[]
    gearCodes: string[]
    hasOneOrMoreReportings: RichBoolean
    isLessThanTwelveMetersVessel: RichBoolean
    isSent: boolean
    lastControlPeriod: LastControlPeriod
    portLocodes: string[]
    priorNotificationTypes: string[]
    seafrontGroup: SeafrontGroup | AllSeafrontGroup | NoSeafrontGroup
    searchQuery: string
    specyCodes: string[]
    statuses: FilterStatus[]
  },
  'expectedArrivalPeriod' | 'seafrontGroup'
>

export type FilterStatus = PriorNotification.State | typeof IS_INVALIDATED | typeof IS_PRIOR_NOTIFICATION_ZERO
