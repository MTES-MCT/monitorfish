import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_LIST_FILTER_VALUES } from './components/PriorNotificationList/constants'

import type { FormValues } from './components/PriorNotificationForm/types'
import type { ListFilter } from './components/PriorNotificationList/types'
import type { PriorNotification } from './PriorNotification.types'
import type { Undefine } from '@mtes-mct/monitor-ui'

export interface PriorNotificationState {
  editedPriorNotificationComputedValues: Undefine<PriorNotification.ManualPriorNotificationComputedValues> | undefined
  editedPriorNotificationInitialFormValues: FormValues | undefined
  isOpenedPriorNotificationManuallyCreated: boolean | undefined
  isPriorNotificationCardOpen: boolean
  isPriorNotificationFormOpen: boolean
  listFilterValues: ListFilter
  openedPriorNotificationReportId: string | undefined
}
const INITIAL_STATE: PriorNotificationState = {
  editedPriorNotificationComputedValues: undefined,
  editedPriorNotificationInitialFormValues: undefined,
  isOpenedPriorNotificationManuallyCreated: undefined,
  isPriorNotificationCardOpen: false,
  isPriorNotificationFormOpen: false,
  listFilterValues: DEFAULT_LIST_FILTER_VALUES,
  openedPriorNotificationReportId: undefined
}

const priorNotificationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'priorNotification',
  reducers: {
    closePriorNotificationCard(state) {
      state.isPriorNotificationCardOpen = false
    },

    closePriorNotificationForm(state) {
      state.editedPriorNotificationComputedValues = undefined
      state.editedPriorNotificationInitialFormValues = undefined
      state.openedPriorNotificationReportId = undefined
      state.isOpenedPriorNotificationManuallyCreated = undefined
      state.isPriorNotificationFormOpen = false
    },

    openPriorNotificationCard(state) {
      state.isPriorNotificationCardOpen = true
    },

    openPriorNotificationForm(state) {
      state.editedPriorNotificationComputedValues = undefined
      state.editedPriorNotificationInitialFormValues = undefined
      state.isOpenedPriorNotificationManuallyCreated = true
      state.openedPriorNotificationReportId = undefined
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

    setEditedPriorNotificationInitialFormValues(state, action: PayloadAction<FormValues>) {
      state.editedPriorNotificationInitialFormValues = action.payload
    },

    setListFilterValues(state, action: PayloadAction<Partial<ListFilter>>) {
      state.listFilterValues = {
        ...state.listFilterValues,
        ...action.payload
      }
    },

    setOpenedPriorNotification(state, action: PayloadAction<{ isManuallyCreated: boolean; reportId: string }>) {
      state.openedPriorNotificationReportId = action.payload.reportId
      state.isOpenedPriorNotificationManuallyCreated = action.payload.isManuallyCreated
    },

    unsetEditedPriorNotificationComputedValues(state) {
      state.editedPriorNotificationComputedValues = undefined
    },

    unsetOpenedPriorNotification(state) {
      state.openedPriorNotificationReportId = undefined
      state.isOpenedPriorNotificationManuallyCreated = undefined
    }
  }
})

export const priorNotificationActions = priorNotificationSlice.actions
export const priorNotificationReducer = priorNotificationSlice.reducer
