import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from '@reduxjs/toolkit'

import type { BannerStackItem } from 'types'

export const bannerStackAdapter = createEntityAdapter({
  selectId: (bannerStackItem: BannerStackItem) => bannerStackItem.id,
  sortComparer: (a, b) => a.id - b.id
})

interface MainWindowState {
  bannerStack: EntityState<BannerStackItem, number>
}
const INITIAL_STATE: MainWindowState = {
  bannerStack: bannerStackAdapter.getInitialState()
}

const mainWindowBannerSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'mainWindowBanner',
  reducers: {
    /**
     * Add a banner to the stack.
     *
     * @internal /!\ This action is not meant to be dispatched directly. Use `addMainWindowBanner()` dispatcher instead.
     */
    addBanner(state, action: PayloadAction<BannerStackItem>) {
      bannerStackAdapter.addOne(state.bannerStack, action.payload)
    },

    /**
     * Remove a banner from the stack.
     *
     * @param action.payload ID of the banner to remove.
     */
    removeBanner(state, action: PayloadAction<number>) {
      bannerStackAdapter.removeOne(state.bannerStack, action.payload)
    }
  }
})

export const mainWindowBannerActions = mainWindowBannerSlice.actions
export const mainWindowBannerReducer = mainWindowBannerSlice.reducer
