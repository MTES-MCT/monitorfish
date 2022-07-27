import React, { useCallback, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import { StyleSheetManager } from 'styled-components'
import { NewWindow } from './NewWindow'
import { resetFocusOnAlert } from '../../domain/shared_slices/Alert'
import { closeSideWindow } from '../../domain/shared_slices/Global'
import SideWindow from './SideWindow'

const SideWindowLauncher = () => {
  const dispatch = useDispatch()
  const {
    openedSideWindowTab
  } = useSelector(state => state.global)
  const [newWindowNode, setNewWindowNode] = useState(null)
  const newWindowRef = useCallback(node => setNewWindowNode(node), [])

  return <>
    {
      openedSideWindowTab && <StyleSheetManager target={newWindowNode}>
        <NewWindow
        copyStyles
        closeOnUnmount
        name={'MonitorFish'}
        title={'MonitorFish'}
        features={{ scrollbars: true, width: window.innerWidth, height: '1200px' }}
        onUnload={() => {
          batch(() => {
            dispatch(closeSideWindow())
            dispatch(resetFocusOnAlert())
          })
        }}
      >
        <SideWindow ref={newWindowRef}/>
      </NewWindow>
      </StyleSheetManager>
  }
  </>
}

export default SideWindowLauncher
