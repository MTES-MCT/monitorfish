import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { sideWindowActions } from '@features/SideWindow/slice'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'

import { SideWindowMenuKey, SideWindowStatus } from '../../../domain/entities/sideWindow/constants'

export function AlertsMapButton() {
  const dispatch = useMainAppDispatch()
  const sideWindow = useMainAppSelector(state => state.sideWindow)

  const isActive =
    sideWindow.status !== SideWindowStatus.CLOSED &&
    sideWindow.selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST

  const toggleSideWindow = () => {
    if (isActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST }))
  }

  return (
    <MapToolButton
      data-cy="alerts-button"
      Icon={Icon.Alert}
      isActive={isActive}
      isLeftButton
      onClick={toggleSideWindow}
      style={{ top: 184 }}
      title="Alertes"
    />
  )
}
