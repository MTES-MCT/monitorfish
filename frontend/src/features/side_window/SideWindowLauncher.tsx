import { useCallback, useState } from 'react'
import { batch } from 'react-redux'
import { StyleSheetManager } from 'styled-components'

import { resetFocusOnPendingAlert } from '../../domain/shared_slices/Alert'
import { closeSideWindow } from '../../domain/shared_slices/Global'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useAppSelector } from '../../hooks/useAppSelector'
import { NewWindow } from './NewWindow'
import { SideWindow } from './SideWindow'

export function SideWindowLauncher() {
  const [newWindowNode, setNewWindowNode] = useState<HTMLDivElement>()
  const dispatch = useAppDispatch()
  const { openedSideWindowTab } = useAppSelector(state => state.global)

  // TODO Understand that.
  const newWindowRef = useCallback((node: HTMLDivElement) => setNewWindowNode(node), [])

  // TODO Handle that behavior in parent components.
  if (!openedSideWindowTab) {
    return null
  }

  return (
    <StyleSheetManager target={newWindowNode}>
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
