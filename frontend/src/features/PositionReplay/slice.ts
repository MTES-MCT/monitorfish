import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export enum PositionReplayStatus {
  OFF = 'OFF',
  /** The replay is started, no date is picked yet: no position is displayed. */
  PICKING_DATE = 'PICKING_DATE',
  REPLAYING = 'REPLAYING'
}

export type PositionReplayState =
  | { status: PositionReplayStatus.OFF }
  | { status: PositionReplayStatus.PICKING_DATE }
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

    setDateTime(state, action: PayloadAction<string | undefined>): PositionReplayState {
      if (state.status === PositionReplayStatus.OFF) {
        return state
      }

      return action.payload
        ? { dateTime: action.payload, status: PositionReplayStatus.REPLAYING }
        : { status: PositionReplayStatus.PICKING_DATE }
    },

    start(): PositionReplayState {
      return { status: PositionReplayStatus.PICKING_DATE }
    }
  }
})

export const positionReplayActions = positionReplaySlice.actions
export const positionReplayReducer = positionReplaySlice.reducer
