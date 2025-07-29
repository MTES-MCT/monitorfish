import { RTK_FORCE_REFETCH_QUERY_OPTIONS, RTK_THIRTY_SECONDS_POLLING_QUERY_OPTIONS } from '@api/constants'
import { ALL_SEAFRONT_GROUP } from '@constants/seafront'
import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { useGetPriorNotificationsToVerifyQuery } from '@features/PriorNotification/priorNotificationApi'
import { SideWindowMenuKey, SideWindowStatus } from '@features/SideWindow/constants'
import { sideWindowActions } from '@features/SideWindow/slice'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'

import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'

export function PriorNotificationListButton() {
  const isSuperUser = useIsSuperUser()
  const dispatch = useMainAppDispatch()
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const sideWindow = useMainAppSelector(state => state.sideWindow)

  const { data } = useGetPriorNotificationsToVerifyQuery(isSuperUser ? undefined : skipToken, {
    ...RTK_THIRTY_SECONDS_POLLING_QUERY_OPTIONS,
    ...RTK_FORCE_REFETCH_QUERY_OPTIONS
  })

  const isActive =
    sideWindow.status !== SideWindowStatus.CLOSED &&
    sideWindow.selectedPath.menu === SideWindowMenuKey.PRIOR_NOTIFICATION_LIST

  const toggleSideWindow = () => {
    if (isActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.PRIOR_NOTIFICATION_LIST }))
  }

  if (previewFilteredVesselsMode) {
    return <></>
  }

  return (
    <MapToolButton
      badgeNumber={
        data?.perSeafrontGroupCount && data?.perSeafrontGroupCount[ALL_SEAFRONT_GROUP] > 0
          ? data?.perSeafrontGroupCount[ALL_SEAFRONT_GROUP]
          : undefined
      }
      Icon={Icon.Fishery}
      isActive={isActive}
      isLeftButton
      onClick={toggleSideWindow}
      style={{ top: isSuperUser ? 232 : 120 }}
      title="Afficher la liste des préavis"
    />
  )
}
