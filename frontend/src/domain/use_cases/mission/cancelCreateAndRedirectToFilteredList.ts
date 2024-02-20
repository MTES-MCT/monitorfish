import { monitorenvMissionApi } from '@features/Mission/components/MissionForm/apis'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { missionListActions } from '@features/Mission/components/MissionList/slice'
import { MissionDateRangeFilter, MissionFilterType } from '@features/SideWindow/MissionList/types'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { customDayjs, logSoftError } from '@mtes-mct/monitor-ui'
import { Mission } from 'domain/entities/mission/types'
import { SideWindowMenuKey } from 'domain/entities/sideWindow/constants'

export const cancelCreateAndRedirectToFilteredList =
  ({ controlUnitName, missionId }: { controlUnitName: string; missionId: number | undefined }) =>
  async dispatch => {
    dispatch(missionFormActions.setEngagedControlUnit(undefined))

    // update filters to redirect to list with only pending mission with the control unit selected
    dispatch(missionListActions.setListFilterValues({}))

    const twoMonthsAgo = customDayjs().subtract(2, 'month').toISOString()
    dispatch(
      missionListActions.setListFilterValues({
        [MissionFilterType.UNIT]: [controlUnitName],
        [MissionFilterType.STATUS]: [Mission.MissionStatus.IN_PROGRESS],
        [MissionFilterType.DATE_RANGE]: MissionDateRangeFilter.CUSTOM,
        [MissionFilterType.CUSTOM_DATE_RANGE]: [twoMonthsAgo, customDayjs().toISOString()]
      })
    )

    await dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }, true))

    if (missionId) {
      try {
        const response = await dispatch(monitorenvMissionApi.endpoints.deleteMission.initiate(missionId))
        if ('error' in response) {
          throw Error('Erreur à la suppression de la mission')
        }
      } catch (error) {
        logSoftError({
          isSideWindowError: true,
          message: '`delete()` failed.',
          originalError: error,
          userMessage: 'Une erreur est survenue pendant la suppression de la mission.'
        })
      }
    }
  }
