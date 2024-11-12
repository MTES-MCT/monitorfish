import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_TABLE_FILTER_VALUES } from './components/PriorNotificationSubscriberTable/constants'

import type { PriorNotificationSubscriber } from './PriorNotificationSubscriber.types'

export interface BackofficePriorNotificationState {
  tableFilterValues: PriorNotificationSubscriber.ApiListFilter
}
const INITIAL_STATE: BackofficePriorNotificationState = {
  tableFilterValues: DEFAULT_TABLE_FILTER_VALUES
}

const backofficePriorNotificationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'priorNotification',
  reducers: {
    setTableFilterValues(state, action: PayloadAction<Partial<PriorNotificationSubscriber.ApiListFilter>>) {
      state.tableFilterValues = {
        ...state.tableFilterValues,
        ...action.payload
      }
    }
  }
})

export const backofficePriorNotificationActions = backofficePriorNotificationSlice.actions
export const backofficePriorNotificationReducer = backofficePriorNotificationSlice.reducer
