import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_LIST_FILTER_VALUES } from './components/PriorNotificationList/constants'
import { PriorNotification } from './PriorNotification.types'

import type { ManualPriorNotificationFormValues } from './components/ManualPriorNotificationForm/types'
import type { ListFilter } from './components/PriorNotificationList/types'
import type { OpenedPriorNotificationType } from './constants'
import type { Undefine } from '@mtes-mct/monitor-ui'

export interface PriorNotificationState {
  editedLogbookPriorNotificationFormValues: PriorNotification.LogbookForm | undefined
  editedManualPriorNotificationComputedValues: Undefine<PriorNotification.ManualComputedValues> | undefined
  editedManualPriorNotificationFormValues: ManualPriorNotificationFormValues | undefined
  // TODO Remove this prop once loading / spinner perfs tests are removed.
  editedPriorNotificationId: string | undefined
  isPriorNotificationFormDirty: boolean
  isReportingListOpened: boolean
  listFilterValues: ListFilter
  openedPriorNotificationComponentType: OpenedPriorNotificationType | undefined
  /** Used for both prior notification forms & card. */
  openedPriorNotificationDetail: PriorNotification.Detail | undefined
}
const INITIAL_STATE: PriorNotificationState = {
  editedLogbookPriorNotificationFormValues: undefined,
  editedManualPriorNotificationComputedValues: undefined,
  editedManualPriorNotificationFormValues: undefined,
  // TODO Remove this prop once loading / spinner perfs tests are removed.
  editedPriorNotificationId: undefined,
  isPriorNotificationFormDirty: false,
  isReportingListOpened: false,
  listFilterValues: DEFAULT_LIST_FILTER_VALUES,
  openedPriorNotificationComponentType: undefined,
  openedPriorNotificationDetail: undefined
}

const priorNotificationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'priorNotification',
  reducers: {
    closePriorNotificationCardAndForm(state) {
      state.editedLogbookPriorNotificationFormValues = undefined
      state.editedPriorNotificationId = undefined
      state.editedManualPriorNotificationComputedValues = undefined
      state.editedManualPriorNotificationFormValues = undefined
      state.isPriorNotificationFormDirty = false
      state.openedPriorNotificationComponentType = undefined
      state.openedPriorNotificationDetail = undefined
    },

    openPriorNotification(state, action: PayloadAction<OpenedPriorNotificationType>) {
      state.openedPriorNotificationComponentType = action.payload
    },

    resetListFilterValues(state) {
      state.listFilterValues = {
        ...DEFAULT_LIST_FILTER_VALUES,
        seafrontGroup: state.listFilterValues.seafrontGroup
      }
    },

    setEditedLogbookPriorNotificationFormValues(state, action: PayloadAction<PriorNotification.LogbookForm>) {
      state.editedLogbookPriorNotificationFormValues = action.payload
    },

    setEditedManualPriorNotificationFormValues(state, action: PayloadAction<ManualPriorNotificationFormValues>) {
      state.editedManualPriorNotificationFormValues = action.payload
    },

    // TODO Remove this function once loading / spinner perfs tests are removed.
    setEditedPriorNotificationId(state, action: PayloadAction<string>) {
      state.editedPriorNotificationId = action.payload
    },

    setIsPriorNotificationFormDirty(state, action: PayloadAction<boolean>) {
      state.isPriorNotificationFormDirty = action.payload
    },

    setIsReportingListOpened(state, action: PayloadAction<boolean>) {
      state.isReportingListOpened = action.payload
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

    setOpenedPriorNotificationDetail(state, action: PayloadAction<PriorNotification.Detail>) {
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
