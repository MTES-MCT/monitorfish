import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export enum PositionReplayStatus {
  OFF = 'OFF',
  REPLAYING = 'REPLAYING'
}

export type PositionReplayState =
  | { status: PositionReplayStatus.OFF }
  | {
      /** UTC ISO date of the replayed positions. */
      dateTime: string
      status: PositionReplayStatus.REPLAYING
    }

const INITIAL_STATE = { status: PositionReplayStatus.OFF } as PositionReplayState

const positionReplaySlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'positionReplay',
  reducers: {
    reset() {
      return INITIAL_STATE
    },

    setDateTime(state, action: PayloadAction<string>): PositionReplayState {
      if (state.status === PositionReplayStatus.OFF) {
        return state
      }

      return { dateTime: action.payload, status: PositionReplayStatus.REPLAYING }
    },

    start(_, action: PayloadAction<string>): PositionReplayState {
      return { dateTime: action.payload, status: PositionReplayStatus.REPLAYING }
    }
  }
})

export const positionReplayActions = positionReplaySlice.actions
export const positionReplayReducer = positionReplaySlice.reducer
