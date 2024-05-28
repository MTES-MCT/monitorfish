import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from '@reduxjs/toolkit'

import { getFullPathFromPath } from './utils'
import { SideWindowMenuKey, SideWindowStatus } from '../../domain/entities/sideWindow/constants'

import type { SideWindow } from './SideWindow.types'

export const bannerStackAdapter = createEntityAdapter({
  selectId: (bannerStackItem: SideWindow.BannerStackItem) => bannerStackItem.id,
  sortComparer: (a, b) => a.id - b.id
})

export interface SideWindowState {
  bannerStack: EntityState<SideWindow.BannerStackItem>
  isDraftCancellationConfirmationDialogOpen: boolean
  nextPath: SideWindow.FullPath | undefined
  selectedPath: SideWindow.FullPath
  status: SideWindowStatus
}
const INITIAL_STATE: SideWindowState = {
  bannerStack: bannerStackAdapter.getInitialState(),
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
     * Add a banner to the stack.
     *
     * @internal
     * /!\ NEVER use this action directly, use `addSideWindowBanner()` use case instead.
     */
    addBanner(state, action: PayloadAction<SideWindow.BannerStackItem>) {
      bannerStackAdapter.addOne(state.bannerStack, action.payload)
    },

    /**
     * Close side window
     */
    close(state) {
      state.status = SideWindowStatus.CLOSED
    },

    /**
     * Close the draft cancellation confirmation dialog.
     *
     * @internal
     * /!\ NEVER use this action directly, use `cancelSideWindowDraftCancellation()` use case instead.
     */
    closeDraftCancellationConfirmationDialog(state) {
      state.isDraftCancellationConfirmationDialogOpen = false
    },

    /**
     * Open the draft cancellation confirmation dialog.
     *
     * @internal
     * /!\ NEVER use this action directly, use `askForSideWindowDraftCancellationConfirmation()` use case instead.
     */
    openDraftCancellationConfirmationDialog(state) {
      state.isDraftCancellationConfirmationDialogOpen = true
      state.status = SideWindowStatus.FOCUSED
    },

    /**
     * Open side window and go to menu + submenu
     *
     * @internal
     * /!\ NEVER use this action directly, use `openSideWindowPath()` use case instead.
     */
    openOrFocusAndGoTo(state, action: PayloadAction<SideWindow.FullPath>) {
      state.nextPath = undefined
      state.selectedPath = action.payload
      state.status = SideWindowStatus.FOCUSED
    },

    /**
     * Remove a banner from the stack.
     *
     * @param action.payload ID of the banner to remove.
     */
    removeBanner(state, action: PayloadAction<number>) {
      bannerStackAdapter.removeOne(state.bannerStack, action.payload)
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
