import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_LIST_FILTER_VALUES } from './components/PriorNotificationList/constants'

import type { ListFilter } from './components/PriorNotificationList/types'
import type { PriorNotification } from './PriorNotification.types'

interface PriorNotificationState {
  editedPriorNotificationComputedValues: PriorNotification.ManualPriorNotificationComputedValues | undefined
  editedPriorNotificationReportId: string | undefined
  isPriorNotificationCardOpen: boolean
  isPriorNotificationFormOpen: boolean
  listFilterValues: ListFilter
  priorNotificationCardDetail: PriorNotification.PriorNotificationDetail | undefined
}
const INITIAL_STATE: PriorNotificationState = {
  editedPriorNotificationComputedValues: undefined,
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
      state.editedPriorNotificationComputedValues = undefined
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
    },

    setPriorNotificationComputedValues(
      state,
      action: PayloadAction<PriorNotification.ManualPriorNotificationComputedValues>
    ) {
      state.editedPriorNotificationComputedValues = action.payload
    },

    unsetPriorNotificationComputedValues(state) {
      state.editedPriorNotificationComputedValues = undefined
    }
  }
})

export const priorNotificationActions = priorNotificationSlice.actions
export const priorNotificationReducer = priorNotificationSlice.reducer
