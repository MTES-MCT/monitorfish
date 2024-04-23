import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'

import { MapToolButton } from './shared/MapToolButton'
import { SideWindowMenuKey, SideWindowStatus } from '../../../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../../../../domain/shared_slices/SideWindow'

export function PriorNotificationListButton() {
  const dispatch = useMainAppDispatch()
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const sideWindow = useMainAppSelector(state => state.sideWindow)

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
    <MapToolButton
      isActive={isActive}
      isLeftButton
      onClick={toggleSideWindow}
      style={{ top: 204 }}
      title="Afficher la liste des préavis"
    >
      <Icon.Fishery color={THEME.color.white} />
    </MapToolButton>
  )
}
