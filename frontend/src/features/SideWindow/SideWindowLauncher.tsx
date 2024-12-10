import { cleanMissionForm } from '@features/SideWindow/useCases/cleanMissionForm'
import { useForceUpdate } from '@hooks/useForceUpdate'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { NewWindow } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect } from 'react'

import { SideWindow } from '.'
import { sideWindowActions } from './slice'
import { SideWindowStatus } from '../../domain/entities/sideWindow/constants'
import { resetFocusOnPendingAlert } from '../Alert/components/SideWindowAlerts/slice'

export function SideWindowLauncher() {
  const dispatch = useMainAppDispatch()
  const hasUnsavedChanges = useMainAppSelector(
    store =>
      store.missionForm.isDraftDirty ||
      store.priorNotification.isPriorNotificationFormDirty ||
      store.priorNotification.isReportingFormDirty
  )
  const status = useMainAppSelector(store => store.sideWindow.status)
  const { forceUpdate } = useForceUpdate()

  const onChangeFocus = useCallback(
    (isFocused: boolean) => {
      const nextStatus = isFocused ? SideWindowStatus.FOCUSED : SideWindowStatus.BLURRED

      dispatch(sideWindowActions.setStatus(nextStatus))
    },
    [dispatch]
  )

  const onUnload = () => {
    dispatch(sideWindowActions.close())
    dispatch(resetFocusOnPendingAlert())
    dispatch(cleanMissionForm())
  }

  useEffect(() => {
    forceUpdate()
  }, [forceUpdate])

  if (status === SideWindowStatus.CLOSED) {
    return null
  }

  return (
    <NewWindow
      closeOnUnmount
      copyStyles
      features={{ height: 1200, width: window.innerWidth }}
      name="MonitorFish"
      onChangeFocus={onChangeFocus}
      onUnload={onUnload}
      shouldHaveFocus={status === SideWindowStatus.FOCUSED}
      showPrompt={hasUnsavedChanges}
      title="MonitorFish"
    >
      <SideWindow isFromURL={false} />
    </NewWindow>
  )
}
