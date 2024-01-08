import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface MainWindowState {
  highlightedStationIds: number[]
  selectedStationId: number | undefined
}
const INITIAL_STATE: MainWindowState = {
  highlightedStationIds: [],
  selectedStationId: undefined
}

const stationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'station',
  reducers: {
    highlightStationIds(state, action: PayloadAction<number[]>) {
      state.highlightedStationIds = action.payload
    },

    selectStationId(state, action: PayloadAction<number | undefined>) {
      state.selectedStationId = action.payload
    }
  }
})

export const stationActions = stationSlice.actions
export const stationReducer = stationSlice.reducer
