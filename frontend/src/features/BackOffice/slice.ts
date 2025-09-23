import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from '@reduxjs/toolkit'

import type { BannerStackItem } from 'types'

export const bannerStackAdapter = createEntityAdapter({
  selectId: (bannerStackItem: BannerStackItem) => bannerStackItem.id,
  sortComparer: (a, b) => a.id - b.id
})

interface BackOfficeState {
  bannerStack: EntityState<BannerStackItem, number>
}
const INITIAL_STATE: BackOfficeState = {
  bannerStack: bannerStackAdapter.getInitialState()
}

const backOfficeSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'backOffice',
  reducers: {
    /**
     * Add a banner to the stack.
     *
     * @internal /!\ This action is not meant to be dispatched directly. Use `addBackOfficeBanner()` dispatcher instead.
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

export const backOfficeActions = backOfficeSlice.actions
export const backOfficeReducer = backOfficeSlice.reducer
