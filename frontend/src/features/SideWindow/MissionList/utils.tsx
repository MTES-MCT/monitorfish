import { DateRange, Tag, TagBullet } from '@mtes-mct/monitor-ui'
import { filter, identity } from 'ramda'

import { MissionDateRangeFilter, MissionFilterType, MissionStatus } from './types'
import { ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS } from '../../../domain/entities/alerts/constants'
import { FrontendError } from '../../../libs/FrontendError'
import { dayjs } from '../../../utils/dayjs'

import type { SeaFront } from '../../../constants'
import type { MissionWithActions } from '../../../domain/entities/mission/types'
import type { AugmentedDataFilter, AugmentedDataItem } from '../../../hooks/useTable/types'

export const getSeaFrontFilter = (selectedSubMenu: string): AugmentedDataFilter<MissionWithActions> => {
  const seaFrontGroup = ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[selectedSubMenu] as
    | {
        menuSeaFront: SeaFront
        seaFronts: string[]
      }
    | undefined

  return (augmentedMissions: Array<AugmentedDataItem<MissionWithActions>>) =>
    augmentedMissions.filter(({ item: { facade } }) =>
      facade && seaFrontGroup ? seaFrontGroup.seaFronts.includes(facade) : true
    )
}

// TODO Add unit tests.
export const mapFilterFormRecordsToFilters = ([key, valueOrValues]: [
  MissionFilterType,
  any
]): AugmentedDataFilter<MissionWithActions> => {
  switch (key) {
    case MissionFilterType.CUSTOM_DATE_RANGE:
      return filter<AugmentedDataItem<MissionWithActions>>(
        ({ item: { endDateTimeUtc, startDateTimeUtc } }) =>
          dayjs(endDateTimeUtc).isSameOrAfter((valueOrValues as DateRange)[0]) &&
          dayjs(startDateTimeUtc).isSameOrBefore((valueOrValues as DateRange)[1])
      )

    case MissionFilterType.DATE_RANGE:
      switch (valueOrValues as MissionDateRangeFilter) {
        case MissionDateRangeFilter.CURRENT_DAY:
          return filter<AugmentedDataItem<MissionWithActions>>(({ item: { endDateTimeUtc } }) =>
            dayjs(endDateTimeUtc).isSameOrAfter(dayjs().startOf('day'))
          )

        case MissionDateRangeFilter.CURRENT_WEEK:
          return filter<AugmentedDataItem<MissionWithActions>>(({ item: { endDateTimeUtc } }) =>
            dayjs(endDateTimeUtc).isSameOrAfter(dayjs().startOf('week'))
          )

        case MissionDateRangeFilter.CURRENT_MONTH:
          return filter<AugmentedDataItem<MissionWithActions>>(({ item: { endDateTimeUtc } }) =>
            dayjs(endDateTimeUtc).isSameOrAfter(dayjs().startOf('month'))
          )

        case MissionDateRangeFilter.CURRENT_QUARTER:
          return filter<AugmentedDataItem<MissionWithActions>>(({ item: { endDateTimeUtc } }) =>
            dayjs(endDateTimeUtc).isSameOrAfter(dayjs().startOf('quarter'))
          )

        // `case MissionDateRangeFilter.CUSTOM:`
        default:
          return identity
      }

    default:
      return typeof (valueOrValues as string | string[]) === 'string'
        ? filter<AugmentedDataItem<MissionWithActions>>(({ item: mission }) => mission[key] === valueOrValues)
        : filter<AugmentedDataItem<MissionWithActions>>(({ item: mission }) => valueOrValues.includes(mission[key]))
  }
}

export const renderStatus = (missionStatus: MissionStatus): JSX.Element => {
  switch (missionStatus) {
    case MissionStatus.INCOMING:
      return (
        <Tag bullet={TagBullet.DISK} bulletColor="#52B0FF" style={{ color: '#52B0FF' }}>
          {MissionStatus.INCOMING}
        </Tag>
      )

    case MissionStatus.IN_PROGRESS:
      return (
        <Tag bullet={TagBullet.DISK} bulletColor="#3660FA" style={{ color: '#3660FA' }}>
          {MissionStatus.IN_PROGRESS}
        </Tag>
      )

    case MissionStatus.DONE:
      return (
        <Tag bullet={TagBullet.DISK} bulletColor="#1400AD" style={{ color: '#1400AD' }}>
          {MissionStatus.DONE}
        </Tag>
      )

    case MissionStatus.CLOSED:
      return (
        <Tag bullet={TagBullet.DISK} bulletColor="#463939" style={{ color: '#463939' }}>
          {MissionStatus.CLOSED}
        </Tag>
      )

    default:
      throw new FrontendError("`missionStatus` doesn't match `MissionStatus` enum.")
  }
}
