import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// import { SeaFrontGroup } from '../../constants'
import { FrontendError } from '../../libs/FrontendError'
import { SideWindowMenuKey, SideWindowStatus } from '../entities/sideWindow/constants'

import type { SideWindow } from '../entities/sideWindow/types'

export interface SideWindowState {
  // hasBeenRenderedOnce: boolean
  isDraftCancellationConfirmationDialogOpen: boolean
  nextPath: SideWindow.Path | undefined
  selectedPath: SideWindow.Path
  status: SideWindowStatus
}
const INITIAL_STATE: SideWindowState = {
  isDraftCancellationConfirmationDialogOpen: false,
  nextPath: undefined,
  selectedPath: {
    menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST
  },
  status: SideWindowStatus.CLOSED
}

const sideWindowSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'sideWindow',
  reducers: {
    /**
     * Show confirmation dialog when a draft is both in progress and dirty before going to menu + submenu
     */
    askForDraftCancellationConfirmationBeforeGoingTo(state, action: PayloadAction<SideWindow.Path>) {
      state.isDraftCancellationConfirmationDialogOpen = true
      state.nextPath = action.payload
      state.status = SideWindowStatus.FOCUSED
    },

    /**
     * Close side window
     */
    close(state) {
      state.status = SideWindowStatus.CLOSED
    },

    /**
     * Toggle side window confirmation modal when a draft is both in progress and dirty
     */
    closeDraftCancellationConfirmationDialog(state) {
      state.isDraftCancellationConfirmationDialogOpen = false
      // We reset this prop that was set by `askForDraftCancellationConfirmationBeforeGoingTo()`
      state.nextPath = undefined
    },

    /**
     * Confirm cancellation of a draft that is both in progress and dirty
     */
    confirmDraftCancellationAndGoToNextMenuWithSubMenu(state) {
      if (!state.nextPath) {
        throw new FrontendError('`state.nextPath` is undefined.')
      }

      state.isDraftCancellationConfirmationDialogOpen = false
      state.selectedPath = state.nextPath
      state.status = SideWindowStatus.FOCUSED

      state.nextPath = undefined
    },

    /**
     * Open side window and go to menu + submenu
     *
     * @description
     * ⚠️ You should only use this action when you are willingly cancelling or saving a current draft in progress.
     * In all other cases, you should use `sideWindowDispatchers.openPath()`.
     */
    openOrFocusAndGoTo(state, action: PayloadAction<SideWindow.Path>) {
      state.selectedPath = action.payload
      state.status = SideWindowStatus.FOCUSED
    },

    /**
     * Set side window status (blurred, closed or focused)
     */
    setStatus(state, action: PayloadAction<SideWindowStatus>) {
      state.status = action.payload
    }
  }
})

export const sideWindowActions = sideWindowSlice.actions

export const sideWindowReducer = sideWindowSlice.reducer
