import { displayedComponentActions } from 'domain/shared_slices/DisplayedComponent'

import { mainWindowActions } from '../slice'

import type { MainAppThunk } from '@store'

// TODO We won't need this intermediate dispatcher once `DisplayedComponent` slice is merged into `MainWindow` slice.
export const hideAllMainWindowComponentsAndSaveDisplayState = (): MainAppThunk => (dispatch, getState) => {
  const { displayedComponent } = getState()

  dispatch(mainWindowActions.setLastDisplayState(displayedComponent))
  dispatch(displayedComponentActions.hideAll())
}
