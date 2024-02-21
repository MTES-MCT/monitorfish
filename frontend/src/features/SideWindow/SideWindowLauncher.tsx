import { NewWindow } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect } from 'react'

import { SideWindow } from '.'
import { resetFocusOnPendingAlert } from './Alert/slice'
import { SideWindowStatus } from '../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../../domain/shared_slices/SideWindow'
import { useForceUpdate } from '../../hooks/useForceUpdate'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

export function SideWindowLauncher() {
  const isDraftDirty = useMainAppSelector(store => store.missionForm.isDraftDirty)
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
      showPrompt={isDraftDirty}
      title="MonitorFish"
    >
      <SideWindow isFromURL={false} />
    </NewWindow>
  )
}
