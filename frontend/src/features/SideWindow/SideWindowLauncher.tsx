import { MutableRefObject, useEffect, useRef } from 'react'
import { batch } from 'react-redux'
import { StyleSheetManager } from 'styled-components'

import { SideWindow } from '.'
import { resetFocusOnPendingAlert } from '../../domain/shared_slices/Alert'
import { closeSideWindow } from '../../domain/shared_slices/Global'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useForceUpdate } from '../../hooks/useForceUpdate'
import { NewWindow } from './NewWindow'

export function SideWindowLauncher() {
  const dispatch = useAppDispatch()
  const newWindowRef = useRef() as MutableRefObject<HTMLDivElement>
  const { forceUpdate } = useForceUpdate()
  useEffect(() => forceUpdate(), [forceUpdate])

  return (
    <StyleSheetManager target={newWindowRef.current}>
      <NewWindow
        closeOnUnmount
        copyStyles
        features={{ height: '1200px', scrollbars: true, width: window.innerWidth }}
        name="MonitorFish"
        onUnload={() => {
          batch(() => {
            dispatch(closeSideWindow())
            dispatch(resetFocusOnPendingAlert())
          })
        }}
        title="MonitorFish"
      >
        <SideWindow ref={newWindowRef} isFromURL={false} />
      </NewWindow>
    </StyleSheetManager>
  )
}
