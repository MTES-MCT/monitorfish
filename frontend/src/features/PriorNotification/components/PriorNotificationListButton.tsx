import { RTK_FORCE_REFETCH_QUERY_OPTIONS, RTK_THIRTY_SECONDS_POLLING_QUERY_OPTIONS } from '@api/constants'
import { ALL_SEAFRONT_GROUP } from '@constants/seafront'
import { useGetPriorNotificationsToVerifyQuery } from '@features/PriorNotification/priorNotificationApi'
import { sideWindowActions } from '@features/SideWindow/slice'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useCallback } from 'react'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'
import { SideWindowMenuKey, SideWindowStatus } from '../../../domain/entities/sideWindow/constants'

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

  const toggleSideWindow = useCallback(() => {
    if (isActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.PRIOR_NOTIFICATION_LIST }))
  }, [dispatch, isActive])

  if (previewFilteredVesselsMode) {
    return <></>
  }

  return (
    <PriorNotificationListIcon
      $isActive={isActive}
      $isHidden={!!previewFilteredVesselsMode}
      $isSuperUser={isSuperUser}
      accent={Accent.PRIMARY}
      aria-label="Afficher la liste des préavis"
      badgeNumber={data?.perSeafrontGroupCount && data?.perSeafrontGroupCount[ALL_SEAFRONT_GROUP]}
      Icon={Icon.Fishery}
      onClick={toggleSideWindow}
      size={Size.LARGE}
      title="Afficher la liste des préavis"
    />
  )
}

const PriorNotificationListIcon = styled(IconButton)<{
  $hasHealthcheckTextWarning?: boolean | undefined
  $isActive: boolean
  $isHidden?: boolean | undefined
  $isSuperUser: boolean
}>`
  ${p => (p.$isActive ? `background: ${p.theme.color.blueGray};` : '')}
  ${p => (p.$isActive ? `border-color: ${p.theme.color.blueGray};` : '')}
  border-radius: 2px;
  height: 40px;
  left: 10px;
  margin-top: ${p => (p.$hasHealthcheckTextWarning ? 50 : 0)}px;
  position: absolute;
  top: ${p => (p.$isSuperUser ? 282 : 170)}px;
  visibility: ${p => (p.$isHidden ? 'hidden' : 'visible')};
  width: 40px;

  > button {
    height: 40px;
    width: 40px;
  }
`
