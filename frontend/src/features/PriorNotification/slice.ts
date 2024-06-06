import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_LIST_FILTER_VALUES } from './components/PriorNotificationList/constants'

import type { ListFilter } from './components/PriorNotificationList/types'
import type { PriorNotification } from './PriorNotification.types'

interface PriorNotificationState {
  editedPriorNotificationReportId: string | undefined
  isPriorNotificationCardOpen: boolean
  isPriorNotificationFormOpen: boolean
  listFilterValues: ListFilter
  priorNotificationCardDetail: PriorNotification.PriorNotificationDetail | undefined
}
const INITIAL_STATE: PriorNotificationState = {
  editedPriorNotificationReportId: undefined,
  isPriorNotificationCardOpen: false,
  isPriorNotificationFormOpen: false,
  listFilterValues: DEFAULT_LIST_FILTER_VALUES,
  priorNotificationCardDetail: undefined
}

const priorNotificationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'priorNotification',
  reducers: {
    closePriorNotificationCard(state) {
      state.isPriorNotificationCardOpen = false
      state.priorNotificationCardDetail = undefined
    },

    closePriorNotificationForm(state) {
      state.isPriorNotificationFormOpen = false
    },

    createOrEditPriorNotification(state, action: PayloadAction<string | undefined>) {
      state.editedPriorNotificationReportId = action.payload
      state.isPriorNotificationFormOpen = true
    },

    openPriorNotificationCard(state) {
      state.isPriorNotificationCardOpen = true
    },

    resetListFilterValues(state) {
      state.listFilterValues = {
        ...DEFAULT_LIST_FILTER_VALUES,
        seafrontGroup: state.listFilterValues.seafrontGroup
      }
    },

    setListFilterValues(state, action: PayloadAction<Partial<ListFilter>>) {
      state.listFilterValues = {
        ...state.listFilterValues,
        ...action.payload
      }
    },

    setPriorNotificationCardDetail(state, action: PayloadAction<PriorNotification.PriorNotificationDetail>) {
      state.priorNotificationCardDetail = action.payload
    }
  }
})

export const priorNotificationActions = priorNotificationSlice.actions
export const priorNotificationReducer = priorNotificationSlice.reducer
