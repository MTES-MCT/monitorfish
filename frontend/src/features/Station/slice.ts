import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { Coordinates } from '@mtes-mct/monitor-ui'

interface MainWindowState {
  highlightedStationIds: number[]
  selectedStationId: number | undefined
  selectedStationOverlayPosition: Coordinates | undefined
}
const INITIAL_STATE: MainWindowState = {
  highlightedStationIds: [],
  selectedStationId: undefined,
  selectedStationOverlayPosition: undefined
}

const stationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'station',
  reducers: {
    hightlightStationIds(state, action: PayloadAction<number[]>) {
      state.highlightedStationIds = action.payload
    },

    selectStation(
      state,
      action: PayloadAction<
        | {
            overlayPosition: Coordinates
            stationId: number
          }
        | undefined
      >
    ) {
      state.selectedStationId = action.payload?.stationId
      state.selectedStationOverlayPosition = action.payload?.overlayPosition
    }
  }
})

export const stationActions = stationSlice.actions
export const stationReducer = stationSlice.reducer
