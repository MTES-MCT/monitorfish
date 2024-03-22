import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_LIST_FILTER_VALUES } from './constants'

import type { ListFilter } from './components/PriorNotificationList/types'

interface PriorNotificationState {
  listFilterValues: ListFilter
}
const INITIAL_STATE: PriorNotificationState = {
  listFilterValues: DEFAULT_LIST_FILTER_VALUES
}

const priorNotificationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'priorNotification',
  reducers: {
    resetListFilterValues(state) {
      state.listFilterValues = DEFAULT_LIST_FILTER_VALUES
    },

    setListFilterValues(state, action: PayloadAction<Partial<ListFilter>>) {
      state.listFilterValues = {
        ...state.listFilterValues,
        ...action.payload
      }
    }
  }
})

export const priorNotificationActions = priorNotificationSlice.actions
export const priorNotificationReducer = priorNotificationSlice.reducer
