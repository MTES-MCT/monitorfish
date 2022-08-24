import { batch, useDispatch, useSelector } from 'react-redux'

import { resetFocusOnAlert } from '../../domain/shared_slices/Alert'
import { closeSideWindow } from '../../domain/shared_slices/Global'
import { NewWindow } from './NewWindow'
import SideWindow from './SideWindow'

function SideWindowLauncher() {
  const { openedSideWindowTab } = useSelector(state => state.global)
  const dispatch = useDispatch()

  return (
    <>
      {openedSideWindowTab ? (
        <NewWindow
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
          <SideWindow />
        </NewWindow>
      ) : null}
    </>
  )
}

export default SideWindowLauncher
