import { type PayloadAction, createSlice } from '@reduxjs/toolkit'

interface ControlUnitDialogState {
  controlUnitId: number | undefined
}

const INITIAL_STATE: ControlUnitDialogState = {
  controlUnitId: undefined
}

const controlUnitDialogSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'controlUnitDialog',
  reducers: {
    /**
     * Set control unit ID to be loaded in map control unit dialog.
     */
    setControlUnitId(state, action: PayloadAction<number>) {
      state.controlUnitId = action.payload
    }
  }
})

export const controlUnitDialogActions = controlUnitDialogSlice.actions
export const controlUnitDialogReducer = controlUnitDialogSlice.reducer
