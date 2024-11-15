import { cleanMissionForm } from '@features/SideWindow/useCases/cleanMissionForm'
import { NewWindow } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect } from 'react'

import { SideWindow } from '.'
import { sideWindowActions } from './slice'
import { SideWindowStatus } from '../../domain/entities/sideWindow/constants'
import { useForceUpdate } from '../../hooks/useForceUpdate'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { resetFocusOnPendingAlert } from '../Alert/components/SideWindowAlerts/slice'

export function SideWindowLauncher() {
  const hasUnsavedChanges = useMainAppSelector(
    store =>
      store.missionForm.isDraftDirty ||
      store.priorNotification.isPriorNotificationFormDirty ||
      store.priorNotification.isReportingFormDirty
  )
  const status = useMainAppSelector(store => store.sideWindow.status)
  const dispatch = useMainAppDispatch()
  const { forceUpdate } = useForceUpdate()

  const handleChangeFocus = useCallback(
    (isFocused: boolean) => {
      const nextStatus = isFocused ? SideWindowStatus.FOCUSED : SideWindowStatus.BLURRED

      dispatch(sideWindowActions.setStatus(nextStatus))
    },
    [dispatch]
  )

  const handleUnload = useCallback(() => {
    dispatch(sideWindowActions.close())
    dispatch(resetFocusOnPendingAlert())
    dispatch(cleanMissionForm())
  }, [dispatch])

  useEffect(() => {
    forceUpdate()
  }, [forceUpdate])

  return (
    <NewWindow
      closeOnUnmount
      copyStyles
      features={{ height: 1200, width: window.innerWidth }}
      name="MonitorFish"
      onChangeFocus={handleChangeFocus}
      onUnload={handleUnload}
      shouldHaveFocus={status === SideWindowStatus.FOCUSED}
      showPrompt={hasUnsavedChanges}
      title="MonitorFish"
    >
      <SideWindow isFromURL={false} />
    </NewWindow>
  )
}
