import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_LIST_FILTER_VALUES } from './components/PriorNotificationList/constants'
import { PriorNotification } from './PriorNotification.types'

import type { ManualPriorNotificationFormValues } from './components/ManualPriorNotificationForm/types'
import type { ListFilter } from './components/PriorNotificationList/types'
import type { Undefine } from '@mtes-mct/monitor-ui'

export interface PriorNotificationState {
  editedLogbookPriorNotificationInitialFormValues: PriorNotification.LogbookPriorNotificationData | undefined
  editedManualPriorNotificationComputedValues: Undefine<PriorNotification.ManualComputedValues> | undefined
  editedManualPriorNotificationInitialFormValues: ManualPriorNotificationFormValues | undefined
  isLogbookPriorNotificationFormOpen: boolean
  isManualPriorNotificationFormOpen: boolean
  isPriorNotificationCardOpen: boolean
  listFilterValues: ListFilter
  /** Used for both prior notification forms & card. */
  openedPriorNotificationDetail: PriorNotification.PriorNotificationDetail | undefined
}
const INITIAL_STATE: PriorNotificationState = {
  editedLogbookPriorNotificationInitialFormValues: undefined,
  editedManualPriorNotificationComputedValues: undefined,
  editedManualPriorNotificationInitialFormValues: undefined,
  isLogbookPriorNotificationFormOpen: false,
  isManualPriorNotificationFormOpen: false,
  isPriorNotificationCardOpen: false,
  listFilterValues: DEFAULT_LIST_FILTER_VALUES,
  openedPriorNotificationDetail: undefined
}

const priorNotificationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'priorNotification',
  reducers: {
    closePriorNotificationCardAndForm(state) {
      state.editedLogbookPriorNotificationInitialFormValues = undefined
      state.editedManualPriorNotificationComputedValues = undefined
      state.editedManualPriorNotificationInitialFormValues = undefined
      state.isPriorNotificationCardOpen = false
      state.isManualPriorNotificationFormOpen = false
      state.isLogbookPriorNotificationFormOpen = false
      state.openedPriorNotificationDetail = undefined
    },

    openLogbookPriorNotificationForm(state) {
      state.isLogbookPriorNotificationFormOpen = true
    },

    openManualPriorNotificationForm(state) {
      state.isManualPriorNotificationFormOpen = true
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

    setEditedLogbookPriorNotificationInitialFormValues(
      state,
      action: PayloadAction<PriorNotification.LogbookPriorNotificationData>
    ) {
      state.editedLogbookPriorNotificationInitialFormValues = action.payload
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

    setManualPriorNotificationComputedValues(
      state,
      action: PayloadAction<Undefine<PriorNotification.ManualComputedValues>>
    ) {
      state.editedManualPriorNotificationComputedValues = action.payload
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
