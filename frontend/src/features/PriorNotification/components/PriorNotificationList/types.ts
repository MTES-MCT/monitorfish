import type { LastControlPeriod, ReceivedAtPeriod } from './constants'
import type { SeaFrontGroup } from '../../../../domain/entities/seaFront/constants'
import type { PriorNotification } from '../../PriorNotification.types'
import type { DateRange, RichBoolean, UndefineExcept } from '@mtes-mct/monitor-ui'

export type ListFilterValues = UndefineExcept<
  {
    countryCodes: string[]
    fleetSegmentSegments: string[]
    gearCodes: string[]
    hasOneOrMoreReportings: RichBoolean
    isLessThanTwelveMetersVessel: RichBoolean
    isSent: boolean
    isVesselPretargeted: boolean
    lastControlPeriod: LastControlPeriod
    portLocodes: string[]
    query: string
    receivedAtCustomDateRange: DateRange
    receivedAtPeriod: ReceivedAtPeriod | undefined
    seaFrontGroup: SeaFrontGroup | 'EXTRA'
    specyCodes: string[]
    types: PriorNotification.PriorNotificationType[]
  },
  'receivedAtPeriod' | 'seaFrontGroup'
>
