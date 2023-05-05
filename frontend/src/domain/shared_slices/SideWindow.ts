import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// import { SeaFrontGroup } from '../../constants'
import { FrontendError } from '../../libs/FrontendError'
import { SideWindowMenuKey, SideWindowStatus } from '../entities/sideWindow/constants'

export interface SideWindowState {
  // hasBeenRenderedOnce: boolean
  isDraftCancellationConfirmationDialogVisible: boolean
  nextMenuWithSubmenu:
    | {
        menu: SideWindowMenuKey
        // subMenu: string
      }
    | undefined
  selectedMenuWithSubMenu: {
    menu: SideWindowMenuKey
    // subMenu: string
  }
  status: SideWindowStatus
}
const INITIAL_STATE: SideWindowState = {
  isDraftCancellationConfirmationDialogVisible: false,
  nextMenuWithSubmenu: undefined,
  selectedMenuWithSubMenu: {
    menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST
    // subMenu: SeaFrontGroup.MED
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
    askForDraftCancellationConfirmationBeforeGoingTo(
      state,
      action: PayloadAction<{
        menu: SideWindowMenuKey
        // subMenu: string
      }>
    ) {
      state.isDraftCancellationConfirmationDialogVisible = true
      state.nextMenuWithSubmenu = action.payload
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
      state.isDraftCancellationConfirmationDialogVisible = false
      // We reset this prop that was set by `askForDraftCancellationConfirmationBeforeGoingTo()`
      state.nextMenuWithSubmenu = undefined
    },

    /**
     * Confirm cancellation of a draft that is both in progress and dirty
     */
    confirmDraftCancellationAndGoToNextMenuWithSubMenu(state) {
      if (!state.nextMenuWithSubmenu) {
        throw new FrontendError('`state.nextMenuWithSubmenu` is undefined.')
      }

      state.isDraftCancellationConfirmationDialogVisible = false
      state.selectedMenuWithSubMenu = state.nextMenuWithSubmenu
      state.status = SideWindowStatus.FOCUSED

      state.nextMenuWithSubmenu = undefined
    },

    /**
     * Open side window and go to menu + submenu
     *
     * @description
     * ⚠️ You should only use this action when you are willingly cancelling or saving a current draft in progress.
     * In all other cases, you should use `sideWindowDispatchers.openMenuWithSubMenu()`.
     */
    openOrFocusAndGoTo(
      state,
      action: PayloadAction<{
        menu: SideWindowMenuKey
        // subMenu: string
      }>
    ) {
      state.selectedMenuWithSubMenu = action.payload
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
