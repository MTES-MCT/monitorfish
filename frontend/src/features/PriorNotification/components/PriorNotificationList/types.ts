import type { LastControlPeriod, ReceivedAtPeriod } from './constants'
import type { SeaFrontGroup } from '../../../../domain/entities/seaFront/constants'
import type { PriorNotification } from '../../PriorNotification.types'
import type { DateAsStringRange, RichBoolean, UndefineExcept } from '@mtes-mct/monitor-ui'

export type ListFilter = UndefineExcept<
  {
    countryCodes: string[]
    fleetSegmentSegments: string[]
    gearCodes: string[]
    hasOneOrMoreReportings: RichBoolean
    isLessThanTwelveMetersVessel: RichBoolean
    isSent: boolean
    lastControlPeriod: LastControlPeriod
    portLocodes: string[]
    receivedAtCustomDateRange: DateAsStringRange
    receivedAtPeriod: ReceivedAtPeriod | undefined
    seaFrontGroup: SeaFrontGroup | 'EXTRA'
    searchQuery: string
    specyCodes: string[]
    types: PriorNotification.PriorNotificationType[]
  },
  'receivedAtPeriod' | 'seaFrontGroup'
>
