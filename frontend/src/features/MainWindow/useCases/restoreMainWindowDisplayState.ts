import { displayedComponentActions } from 'domain/shared_slices/DisplayedComponent'

import type { MainAppThunk } from '@store'

// TODO We won't need this intermediate dispatcher once `DisplayedComponent` slice is merged into `MainWindow` slice.
export const restoreMainWindowDisplayState = (): MainAppThunk => (dispatch, getState) => {
  const { mainWindow } = getState()

  dispatch(displayedComponentActions.setDisplayedComponents(mainWindow.lastDisplayState))
}
