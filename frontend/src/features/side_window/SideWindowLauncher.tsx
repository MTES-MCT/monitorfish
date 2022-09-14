import React, { useCallback, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import { StyleSheetManager } from 'styled-components'

import { resetFocusOnAlert } from '../../domain/shared_slices/Alert'
import { closeSideWindow } from '../../domain/shared_slices/Global'
import { NewWindow } from './NewWindow'
import { SideWindow } from './SideWindow'

function SideWindowLauncher() {
  const dispatch = useDispatch()
  const { openedSideWindowTab } = useSelector(state => state.global)
  const [newWindowNode, setNewWindowNode] = useState(null)
  const newWindowRef = useCallback(node => setNewWindowNode(node), [])

  return (
    <>
      {openedSideWindowTab && (
        <StyleSheetManager target={newWindowNode}>
          <NewWindow
            closeOnUnmount
            copyStyles
            features={{ height: '1200px', scrollbars: true, width: window.innerWidth }}
            name="MonitorFish"
            onUnload={() => {
              batch(() => {
                dispatch(closeSideWindow())
                dispatch(resetFocusOnAlert())
              })
            }}
            title="MonitorFish"
          >
            <SideWindow ref={newWindowRef} isFromURL={false} />
          </NewWindow>
        </StyleSheetManager>
      )}
    </>
  )
}

export default SideWindowLauncher
