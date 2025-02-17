import { type PayloadAction, createSlice } from '@reduxjs/toolkit'
import { set } from 'lodash-es'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import type { FiltersState } from './types'

type ControlUnitListDialogState = {
  filtersState: FiltersState
}

const INITIAL_STATE: ControlUnitListDialogState = {
  filtersState: {}
}

const persistConfig = {
  key: 'controlUnitListDialog',
  storage
}

const controlUnitListDialogSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'controlUnitListDialog',
  reducers: {
    setFilter(
      state,
      action: PayloadAction<{
        key: keyof FiltersState
        value: any
      }>
    ) {
      state.filtersState = set(state.filtersState, action.payload.key, action.payload.value)
    }
  }
})

export const controlUnitListDialogActions = controlUnitListDialogSlice.actions

export const controlUnitListDialogPersistedReducer = persistReducer(persistConfig, controlUnitListDialogSlice.reducer)
