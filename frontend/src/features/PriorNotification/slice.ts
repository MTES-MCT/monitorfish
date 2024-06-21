import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_LIST_FILTER_VALUES } from './components/PriorNotificationList/constants'

import type { FormValues } from './components/PriorNotificationForm/types'
import type { ListFilter } from './components/PriorNotificationList/types'
import type { PriorNotification } from './PriorNotification.types'
import type { Undefine } from '@mtes-mct/monitor-ui'

interface PriorNotificationState {
  editedPriorNotificationComputedValues: Undefine<PriorNotification.ManualPriorNotificationComputedValues> | undefined
  editedPriorNotificationDetail: PriorNotification.PriorNotificationDetail | undefined
  editedPriorNotificationInitialFormValues: FormValues | undefined
  editedPriorNotificationReportId: string | undefined
  isPriorNotificationCardOpen: boolean
  isPriorNotificationFormOpen: boolean
  listFilterValues: ListFilter
  priorNotificationCardDetail: PriorNotification.PriorNotificationDetail | undefined
}
const INITIAL_STATE: PriorNotificationState = {
  editedPriorNotificationComputedValues: undefined,
  editedPriorNotificationDetail: undefined,
  editedPriorNotificationInitialFormValues: undefined,
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
      state.editedPriorNotificationComputedValues = undefined
      state.editedPriorNotificationInitialFormValues = undefined
      state.editedPriorNotificationReportId = undefined
      state.isPriorNotificationFormOpen = false
    },

    openPriorNotificationCard(state) {
      state.isPriorNotificationCardOpen = true
    },

    openPriorNotificationForm(state) {
      state.isPriorNotificationFormOpen = true
    },

    resetListFilterValues(state) {
      state.listFilterValues = {
        ...DEFAULT_LIST_FILTER_VALUES,
        seafrontGroup: state.listFilterValues.seafrontGroup
      }
    },

    setEditedPriorNotificationComputedValues(
      state,
      action: PayloadAction<Undefine<PriorNotification.ManualPriorNotificationComputedValues>>
    ) {
      state.editedPriorNotificationComputedValues = action.payload
    },

    setEditedPriorNotificationDetail(state, action: PayloadAction<PriorNotification.PriorNotificationDetail>) {
      state.editedPriorNotificationDetail = action.payload
    },

    setEditedPriorNotificationInitialFormValues(state, action: PayloadAction<FormValues>) {
      state.editedPriorNotificationInitialFormValues = action.payload
    },

    setEditedPriorNotificationReportId(state, action: PayloadAction<string>) {
      state.editedPriorNotificationReportId = action.payload
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

    unsetEditedPriorNotificationComputedValues(state) {
      state.editedPriorNotificationComputedValues = undefined
    },

    unsetEditedPriorNotificationDetail(state) {
      state.editedPriorNotificationDetail = undefined
    },

    unsetEditedPriorNotificationReportId(state) {
      state.editedPriorNotificationReportId = undefined
    }
  }
})

export const priorNotificationActions = priorNotificationSlice.actions
export const priorNotificationReducer = priorNotificationSlice.reducer
