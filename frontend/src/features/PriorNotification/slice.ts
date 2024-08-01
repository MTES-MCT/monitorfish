import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_LIST_FILTER_VALUES } from './components/PriorNotificationList/constants'
import { PriorNotification } from './PriorNotification.types'

import type { ManualPriorNotificationFormValues } from './components/ManualPriorNotificationForm/types'
import type { ListFilter } from './components/PriorNotificationList/types'
import type { Undefine } from '@mtes-mct/monitor-ui'

export interface PriorNotificationState {
  editedAutoPriorNotificationInitialFormValues: PriorNotification.AutoPriorNotificationData | undefined
  editedManualPriorNotificationComputedValues: Undefine<PriorNotification.ManualComputedValues> | undefined
  editedManualPriorNotificationInitialFormValues: ManualPriorNotificationFormValues | undefined
  isPriorNotificationCardOpen: boolean
  isPriorNotificationFormOpen: boolean
  listFilterValues: ListFilter
  /** Used for both prior notification forms & card. */
  openedPriorNotificationDetail: PriorNotification.PriorNotificationDetail | undefined
}
const INITIAL_STATE: PriorNotificationState = {
  editedAutoPriorNotificationInitialFormValues: undefined,
  editedManualPriorNotificationComputedValues: undefined,
  editedManualPriorNotificationInitialFormValues: undefined,
  isPriorNotificationCardOpen: false,
  isPriorNotificationFormOpen: false,
  listFilterValues: DEFAULT_LIST_FILTER_VALUES,
  openedPriorNotificationDetail: undefined
}

const priorNotificationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'priorNotification',
  reducers: {
    closePriorNotificationCard(state) {
      state.isPriorNotificationCardOpen = false
      state.openedPriorNotificationDetail = undefined
    },

    closePriorNotificationForm(state) {
      state.editedAutoPriorNotificationInitialFormValues = undefined
      state.editedManualPriorNotificationComputedValues = undefined
      state.editedManualPriorNotificationInitialFormValues = undefined
      state.isPriorNotificationFormOpen = false
      state.openedPriorNotificationDetail = undefined
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

    setEditedAutoPriorNotificationInitialFormValues(
      state,
      action: PayloadAction<PriorNotification.AutoPriorNotificationData>
    ) {
      state.editedAutoPriorNotificationInitialFormValues = action.payload
    },

    setEditedManualPriorNotificationComputedValues(
      state,
      action: PayloadAction<Undefine<PriorNotification.ManualComputedValues>>
    ) {
      state.editedManualPriorNotificationComputedValues = action.payload
    },

    setEditedManualPriorNotificationInitialFormValues(state, action: PayloadAction<ManualPriorNotificationFormValues>) {
      state.editedManualPriorNotificationInitialFormValues = action.payload
    },

    setListFilterValues(state, action: PayloadAction<Partial<ListFilter>>) {
      state.listFilterValues = {
        ...state.listFilterValues,
        ...action.payload
      }
    },

    setOpenedPriorNotification(state, action: PayloadAction<PriorNotification.PriorNotificationDetail>) {
      state.openedPriorNotificationDetail = action.payload
    },

    unsetEditedPriorNotificationComputedValues(state) {
      state.editedManualPriorNotificationComputedValues = undefined
    },

    unsetOpenedPriorNotificationDetail(state) {
      state.openedPriorNotificationDetail = undefined
    }
  }
})

export const priorNotificationActions = priorNotificationSlice.actions
export const priorNotificationReducer = priorNotificationSlice.reducer
