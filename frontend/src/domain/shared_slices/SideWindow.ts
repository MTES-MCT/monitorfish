import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

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
    menu: SideWindowMenuKey.PRIOR_NOTIFICATION_LIST
  }),
  status: SideWindowStatus.CLOSED
}

const sideWindowSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'sideWindow',
  reducers: {
    /**
     * Close side window
     */
    close(state) {
      state.status = SideWindowStatus.CLOSED
    },

    /**
     * Close the draft cancellation confirmation dialog.
     *
     * @description
     * ⚠️ NEVER use this action directly, use `cancelSideWindowDraftCancellation()` use case instead.
     */
    closeDraftCancellationConfirmationDialog(state) {
      state.isDraftCancellationConfirmationDialogOpen = false
    },

    /**
     * Open the draft cancellation confirmation dialog.
     *
     * @description
     * ⚠️ NEVER use this action directly, use `askForSideWindowDraftCancellationConfirmation()` use case instead.
     */
    openDraftCancellationConfirmationDialog(state) {
      state.isDraftCancellationConfirmationDialogOpen = true
      state.status = SideWindowStatus.FOCUSED
    },

    /**
     * Open side window and go to menu + submenu
     *
     * @description
     * ⚠️ NEVER use this action directly, use `openSideWindowPath()` use case instead.
     */
    openOrFocusAndGoTo(state, action: PayloadAction<SideWindow.FullPath>) {
      state.nextPath = undefined
      state.selectedPath = action.payload
      state.status = SideWindowStatus.FOCUSED
    },

    /**
     * Set next path.
     *
     * @description
     * Used to store the next path while waiting for user confirmation before changing path.
     */
    setNextPath(state, action: PayloadAction<SideWindow.FullPath>) {
      state.nextPath = action.payload
    },

    /**
     * Set current path.
     */
    setSelectedPath(state, action: PayloadAction<SideWindow.FullPath>) {
      state.nextPath = undefined
      state.selectedPath = action.payload
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
    },

    /**
     * Unset next path.
     */
    unsetNextPath(state) {
      state.nextPath = undefined
    }
  }
})

export const sideWindowActions = sideWindowSlice.actions

export const sideWindowReducer = sideWindowSlice.reducer
