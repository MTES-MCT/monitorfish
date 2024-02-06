import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { FrontendError } from '../../libs/FrontendError'
import { SideWindowMenuKey, SideWindowStatus } from '../entities/sideWindow/constants'
import { getFullPathFromPath } from '../entities/sideWindow/utils'

import type { SideWindow } from '../entities/sideWindow/types'

export interface SideWindowState {
  isDraftCancellationConfirmationDialogOpen: boolean
  nextPath: SideWindow.FullPath | undefined
  selectedPath: SideWindow.FullPath
  status: SideWindowStatus
}
const INITIAL_STATE: SideWindowState = {
  isDraftCancellationConfirmationDialogOpen: false,
  nextPath: undefined,
  selectedPath: getFullPathFromPath({
    menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST
  }),
  status: SideWindowStatus.CLOSED
}

const sideWindowSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'sideWindow',
  reducers: {
    /**
     * Show confirmation dialog when a draft is both in progress and dirty before going to menu + submenu
     */
    askForDraftCancellationConfirmationBeforeGoingTo(state, action: PayloadAction<SideWindow.FullPath>) {
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
      // We reset this prop that was set by `askForDraftCancellationConfirmationBeforeGoingToPath()`
      state.nextPath = undefined
    },

    /**
     * Confirm cancellation of a draft that is both in progress and dirty
     */
    hideDraftCancellationConfirmationDialogAndGoToNextPath(state) {
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
     * In all other cases, you should use `openPath()`.
     */
    openOrFocusAndGoTo(state, action: PayloadAction<SideWindow.FullPath>) {
      state.selectedPath = action.payload
      state.status = SideWindowStatus.FOCUSED
    },

    /**
     * Set selected path loading state.
     */
    setSelectedPathIsLoading(state, action: PayloadAction<boolean>) {
      state.selectedPath.isLoading = action.payload
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
