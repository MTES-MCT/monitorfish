import type { LastControlPeriod, ExpectedArrivalPeriod } from './constants'
import type { SeaFrontGroup } from '../../../../domain/entities/seaFront/constants'
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
    seaFrontGroup: SeaFrontGroup | 'EXTRA'
    searchQuery: string
    specyCodes: string[]
    types: string[]
  },
  'expectedArrivalPeriod' | 'seaFrontGroup'
>