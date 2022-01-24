import React from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import { closeSideWindow } from '../../domain/shared_slices/Global'
import NewWindow from 'react-new-window'
import { resetFocusOnAlert } from '../../domain/shared_slices/Alert'
import SideWindow from './SideWindow'

const SideWindowLauncher = () => {
  const {
    openedSideWindowTab
  } = useSelector(state => state.global)
  const dispatch = useDispatch()

  return <>{openedSideWindowTab
    ? <NewWindow
      copyStyles
      name={'MonitorFish'}
      title={'MonitorFish'}
      features={{ scrollbars: true, width: '1500px', height: '1200px' }}
      onUnload={() => {
        batch(() => {
          dispatch(closeSideWindow())
          dispatch(resetFocusOnAlert())
        })
      }}
    >
      <SideWindow/>
    </NewWindow>
    : null
  }
  </>
}

export default SideWindowLauncher
