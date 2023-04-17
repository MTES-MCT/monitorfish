import { Tag, TagBullet, customDayjs } from '@mtes-mct/monitor-ui'
import { filter, identity } from 'ramda'

import { MissionDateRangeFilter, MissionFilterType } from './types'
import { SEA_FRONT_GROUP_SEA_FRONTS } from '../../../constants'
import { getMissionStatus } from '../../../domain/entities/mission'
import { Mission } from '../../../domain/entities/mission/types'
import { FrontendError } from '../../../libs/FrontendError'
import { includesSome } from '../../../utils/includesSome'

import type { MissionWithActions } from '../../../domain/entities/mission/types'
import type { AugmentedDataFilter, AugmentedDataItem } from '../../../hooks/useTable/types'
import type { OpUnitType, QUnitType } from 'dayjs'

export const getSeaFrontFilter = (selectedSubMenu: string): AugmentedDataFilter<MissionWithActions> => {
  const seaFrontGroupSeaFronts = SEA_FRONT_GROUP_SEA_FRONTS[selectedSubMenu]

  return (augmentedMissions: Array<AugmentedDataItem<MissionWithActions>>) =>
    augmentedMissions.filter(({ item: { facade } }) =>
      facade && seaFrontGroupSeaFronts ? seaFrontGroupSeaFronts.includes(facade) : true
    )
}

const isSameOrAfterStartOf = (unit: QUnitType | OpUnitType, utcDateIsoString: string): boolean =>
  customDayjs(utcDateIsoString).utc().isSameOrAfter(customDayjs().utc().startOf(unit))

// TODO Add unit tests.
export const mapFilterFormRecordsToFilters = ([key, valueOrValues]: [
  MissionFilterType,
  any
]): AugmentedDataFilter<MissionWithActions> => {
  switch (key) {
    case MissionFilterType.ADMINISTRATION:
      return filter<AugmentedDataItem<MissionWithActions>>(({ item: { controlUnits } }) => {
        const missionWithActionsAdministrations = controlUnits.map(({ administration }) => administration)

        return includesSome(valueOrValues, missionWithActionsAdministrations)
      })

    case MissionFilterType.CUSTOM_DATE_RANGE:
      return filter<AugmentedDataItem<MissionWithActions>>(({ item: { endDateTimeUtc, startDateTimeUtc } }) =>
        endDateTimeUtc
          ? customDayjs(startDateTimeUtc).utc().isSameOrAfter(customDayjs(valueOrValues[0]).utc()) &&
            customDayjs(endDateTimeUtc).utc().isSameOrBefore(customDayjs(valueOrValues[1]).utc())
          : customDayjs(startDateTimeUtc).utc().isSameOrAfter(customDayjs(valueOrValues[0]).utc())
      )

    case MissionFilterType.DATE_RANGE:
      switch (valueOrValues as MissionDateRangeFilter) {
        case MissionDateRangeFilter.CURRENT_DAY:
          return filter<AugmentedDataItem<MissionWithActions>>(({ item: { startDateTimeUtc } }) =>
            isSameOrAfterStartOf('day', startDateTimeUtc)
          )

        case MissionDateRangeFilter.CURRENT_WEEK:
          return filter<AugmentedDataItem<MissionWithActions>>(({ item: { startDateTimeUtc } }) =>
            isSameOrAfterStartOf('week', startDateTimeUtc)
          )

        case MissionDateRangeFilter.CURRENT_MONTH:
          return filter<AugmentedDataItem<MissionWithActions>>(({ item: { startDateTimeUtc } }) =>
            isSameOrAfterStartOf('month', startDateTimeUtc)
          )

        case MissionDateRangeFilter.CURRENT_QUARTER:
          return filter<AugmentedDataItem<MissionWithActions>>(({ item: { startDateTimeUtc } }) =>
            isSameOrAfterStartOf('quarter', startDateTimeUtc)
          )

        case MissionDateRangeFilter.CURRENT_YEAR:
          return filter<AugmentedDataItem<MissionWithActions>>(({ item: { startDateTimeUtc } }) =>
            isSameOrAfterStartOf('year', startDateTimeUtc)
          )

        // `case MissionDateRangeFilter.CUSTOM:`
        default:
          return identity
      }

    case MissionFilterType.SOURCE:
      return filter<AugmentedDataItem<MissionWithActions>>(({ item: { missionSource } }) =>
        valueOrValues.includes(missionSource)
      )

    case MissionFilterType.STATUS:
      return filter<AugmentedDataItem<MissionWithActions>>(({ item: missionWithActions }) => {
        const status = getMissionStatus(missionWithActions)

        return valueOrValues.includes(status)
      })

    case MissionFilterType.TYPE:
      return filter<AugmentedDataItem<MissionWithActions>>(({ item: { missionTypes } }) =>
        includesSome(valueOrValues, missionTypes)
      )

    case MissionFilterType.UNIT:
      return filter<AugmentedDataItem<MissionWithActions>>(({ item: { controlUnits } }) => {
        const missionWithActionsUnits = controlUnits.map(({ name }) => name)

        return includesSome(valueOrValues, missionWithActionsUnits)
      })

    default:
      throw new FrontendError("`key` doesn't match `MissionFilterType` enum.")
  }
}

export const renderStatus = (missionStatus: Mission.MissionStatus): JSX.Element => {
  switch (missionStatus) {
    case Mission.MissionStatus.UPCOMING:
      return (
        <Tag bullet={TagBullet.DISK} bulletColor="#52B0FF" style={{ color: '#52B0FF' }}>
          {Mission.MissionStatusLabel.UPCOMING}
        </Tag>
      )

    case Mission.MissionStatus.IN_PROGRESS:
      return (
        <Tag bullet={TagBullet.DISK} bulletColor="#3660FA" style={{ color: '#3660FA' }}>
          {Mission.MissionStatusLabel.IN_PROGRESS}
        </Tag>
      )

    case Mission.MissionStatus.DONE:
      return (
        <Tag bullet={TagBullet.DISK} bulletColor="#1400AD" style={{ color: '#1400AD' }}>
          {Mission.MissionStatusLabel.DONE}
        </Tag>
      )

    case Mission.MissionStatus.CLOSED:
      return (
        <Tag bullet={TagBullet.DISK} bulletColor="#463939" style={{ color: '#463939' }}>
          {Mission.MissionStatusLabel.CLOSED}
        </Tag>
      )

    default:
      throw new FrontendError("`missionStatus` doesn't match `MissionStatus` enum.")
  }
}
