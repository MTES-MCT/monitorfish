import { NewWindow } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useRef } from 'react'
import { batch } from 'react-redux'
import { StyleSheetManager } from 'styled-components'

import { SideWindow } from '.'
import { resetFocusOnPendingAlert } from './Alert/slice'
import { SideWindowStatus } from '../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../../domain/shared_slices/SideWindow'
import { useForceUpdate } from '../../hooks/useForceUpdate'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

import type { MutableRefObject } from 'react'

export function SideWindowLauncher() {
  const newWindowRef = useRef() as MutableRefObject<HTMLDivElement>

  const mission = useMainAppSelector(store => store.mission)
  const sideWindow = useMainAppSelector(store => store.sideWindow)
  const dispatch = useMainAppDispatch()
  const { forceUpdate } = useForceUpdate()

  const hasDraftInProgress = !!mission.draft

  const handleChangeFocus = useCallback(
    (isFocused: boolean) => {
      const nextStatus = isFocused ? SideWindowStatus.FOCUSED : SideWindowStatus.BLURRED

      dispatch(sideWindowActions.setStatus(nextStatus))
    },
    [dispatch]
  )

  const handleUnload = useCallback(() => {
    batch(() => {
      dispatch(sideWindowActions.close())
      dispatch(resetFocusOnPendingAlert())
    })
  }, [dispatch])

  useEffect(() => {
    forceUpdate()
  }, [forceUpdate])

  return (
    <StyleSheetManager target={newWindowRef.current}>
      <NewWindow
        closeOnUnmount
        copyStyles
        features={{ height: 1200, width: window.innerWidth }}
        name="MonitorFish"
        onChangeFocus={handleChangeFocus}
        onUnload={handleUnload}
        shouldHaveFocus={sideWindow.status === SideWindowStatus.FOCUSED}
        showPrompt={hasDraftInProgress}
        title="MonitorFish"
      >
        <SideWindow ref={newWindowRef} isFromURL={false} />
      </NewWindow>
    </StyleSheetManager>
  )
}
