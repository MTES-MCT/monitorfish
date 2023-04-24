import { Tag, TagBullet, customDayjs } from '@mtes-mct/monitor-ui'
import { filter } from 'ramda'
import styled from 'styled-components'

import { MissionDateRangeFilter } from './types'
import { ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS } from '../../../domain/entities/alerts/constants'
import { getMissionStatus } from '../../../domain/entities/mission'
import { Mission } from '../../../domain/entities/mission/types'
import { FrontendError } from '../../../libs/FrontendError'
import { includesSome } from '../../../utils/includesSome'

import type { FilterValues } from './types'
import type { SeaFront } from '../../../constants'
import type { MissionWithActions } from '../../../domain/entities/mission/types'
import type { FilterFunction } from '../../../hooks/useTable/types'
import type { OpUnitType, QUnitType } from 'dayjs'

export const getSeaFrontFilterFunction = (selectedSubMenu: string): FilterFunction<MissionWithActions> => {
  const seaFrontGroup = ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[selectedSubMenu] as
    | {
        menuSeaFront: SeaFront
        seaFronts: string[]
      }
    | undefined

  return (augmentedMissions: MissionWithActions[]) =>
    augmentedMissions.filter(({ facade }) =>
      facade && seaFrontGroup ? seaFrontGroup.seaFronts.includes(facade) : true
    )
}

const isSameOrAfterStartOf = (unit: QUnitType | OpUnitType, utcDateIsoString: string): boolean =>
  customDayjs(utcDateIsoString).utc().isSameOrAfter(customDayjs().utc().startOf(unit))

// TODO Add unit tests.
export const mapFilterValuesToFilterFunctions = (filterValues: FilterValues): FilterFunction<MissionWithActions>[] => {
  const filterFunctions: FilterFunction<MissionWithActions>[] = []

  if (filterValues.ADMINISTRATION) {
    filterFunctions.push(
      filter<MissionWithActions>(({ controlUnits }) => {
        const missionWithActionsAdministrations = controlUnits.map(({ administration }) => administration)

        return includesSome(filterValues.ADMINISTRATION, missionWithActionsAdministrations)
      })
    )
  }

  if (filterValues.CUSTOM_DATE_RANGE) {
    filterFunctions.push(
      filter<MissionWithActions>(({ endDateTimeUtc, startDateTimeUtc }) =>
        endDateTimeUtc
          ? customDayjs(startDateTimeUtc).utc().isSameOrAfter(customDayjs(filterValues.CUSTOM_DATE_RANGE[0]).utc()) &&
            customDayjs(endDateTimeUtc).utc().isSameOrBefore(customDayjs(filterValues.CUSTOM_DATE_RANGE[1]).utc())
          : customDayjs(startDateTimeUtc).utc().isSameOrAfter(customDayjs(filterValues.CUSTOM_DATE_RANGE[0]).utc())
      )
    )
  }

  if (filterValues.DATE_RANGE) {
    switch (filterValues.DATE_RANGE) {
      case MissionDateRangeFilter.CURRENT_DAY:
        filterFunctions.push(
          filter<MissionWithActions>(({ startDateTimeUtc }) => isSameOrAfterStartOf('day', startDateTimeUtc))
        )
        break

      case MissionDateRangeFilter.CURRENT_WEEK:
        filterFunctions.push(
          filter<MissionWithActions>(({ startDateTimeUtc }) => isSameOrAfterStartOf('week', startDateTimeUtc))
        )
        break

      case MissionDateRangeFilter.CURRENT_MONTH:
        filterFunctions.push(
          filter<MissionWithActions>(({ startDateTimeUtc }) => isSameOrAfterStartOf('month', startDateTimeUtc))
        )
        break

      case MissionDateRangeFilter.CURRENT_QUARTER:
        filterFunctions.push(
          filter<MissionWithActions>(({ startDateTimeUtc }) => isSameOrAfterStartOf('quarter', startDateTimeUtc))
        )
        break

      case MissionDateRangeFilter.CURRENT_YEAR:
        filterFunctions.push(
          filter<MissionWithActions>(({ startDateTimeUtc }) => isSameOrAfterStartOf('year', startDateTimeUtc))
        )
        break

      default:
        break
    }
  }

  if (filterValues.SOURCE) {
    filterFunctions.push(filter<MissionWithActions>(({ missionSource }) => filterValues.SOURCE.includes(missionSource)))
  }

  if (filterValues.STATUS) {
    filterFunctions.push(
      filter<MissionWithActions>(missionWithActions => {
        const status = getMissionStatus(missionWithActions)

        return filterValues.STATUS.includes(status)
      })
    )
  }

  if (filterValues.TYPE) {
    filterFunctions.push(
      filter<MissionWithActions>(({ missionTypes }) => includesSome(filterValues.TYPE, missionTypes))
    )
  }

  if (filterValues.UNIT) {
    filterFunctions.push(
      filter<MissionWithActions>(({ controlUnits }) => {
        const missionWithActionsUnits = controlUnits.map(({ name }) => name)

        return includesSome(filterValues.UNIT, missionWithActionsUnits)
      })
    )
  }

  return filterFunctions
}

export const renderStatus = (missionStatus: Mission.MissionStatus): JSX.Element => {
  switch (missionStatus) {
    case Mission.MissionStatus.UPCOMING:
      return (
        <StyledTag bullet={TagBullet.DISK} bulletColor="#52B0FF" style={{ color: '#52B0FF' }}>
          {Mission.MissionStatusLabel.UPCOMING}
        </StyledTag>
      )

    case Mission.MissionStatus.IN_PROGRESS:
      return (
        <StyledTag bullet={TagBullet.DISK} bulletColor="#3660FA" style={{ color: '#3660FA' }}>
          {Mission.MissionStatusLabel.IN_PROGRESS}
        </StyledTag>
      )

    case Mission.MissionStatus.DONE:
      return (
        <StyledTag bullet={TagBullet.DISK} bulletColor="#1400AD" style={{ color: '#1400AD' }}>
          {Mission.MissionStatusLabel.DONE}
        </StyledTag>
      )

    case Mission.MissionStatus.CLOSED:
      return (
        <StyledTag bullet={TagBullet.DISK} bulletColor="#463939" style={{ color: '#463939' }}>
          {Mission.MissionStatusLabel.CLOSED}
        </StyledTag>
      )

    default:
      throw new FrontendError("`missionStatus` doesn't match `MissionStatus` enum.")
  }
}

const StyledTag = styled(Tag)`
  align-items: flex-end;
  display: flex;
  line-height: 1;

  > span {
    height: 10px;
    width: 10px;
  }
`
