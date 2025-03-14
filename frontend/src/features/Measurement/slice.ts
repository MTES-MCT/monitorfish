import { createSlice } from '@reduxjs/toolkit'

import type { MeasurementType } from '@features/Map/constants'
import type { CircleMeasurementToAdd, DrawedMeasurement } from '@features/Measurement/types'
import type { PayloadAction } from '@reduxjs/toolkit'

export type MeasurementState = {
  // TODO Type this prop.
  circleMeasurementInDrawing: {
    coordinates: number[]
    measurement: any
  } | null
  circleMeasurementToAdd: CircleMeasurementToAdd | undefined
  measurementTypeToAdd: MeasurementType | null
  measurementsDrawed: DrawedMeasurement[]
}
const INITIAL_STATE: MeasurementState = {
  circleMeasurementInDrawing: null,
  circleMeasurementToAdd: undefined,
  measurementsDrawed: [],
  measurementTypeToAdd: null
}

const measurementSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'measurement',
  reducers: {
    addMeasurementDrawed(state, action: PayloadAction<DrawedMeasurement>) {
      state.measurementsDrawed = state.measurementsDrawed.concat(action.payload)
    },
    removeMeasurementDrawed(state, action: PayloadAction<string>) {
      state.measurementsDrawed = state.measurementsDrawed.filter(measurement => measurement.id !== action.payload)
    },
    resetCircleMeasurementInDrawing(state) {
      state.circleMeasurementInDrawing = null
    },
    resetCircleMeasurementToAdd(state) {
      state.circleMeasurementToAdd = undefined
    },

    resetMeasurementTypeToAdd(state) {
      state.measurementTypeToAdd = null
    },

    /**
     * Add a circle measurement currently in drawing mode - so the
     * current measurement done in the map is showed in the Measurement box
     * @param {Object=} state
     * @param {{
     *  payload: {
          circleCoordinates: string
          circleRadius: string
        }
     * }} action - The coordinates and radius of the measurement
     */
    setCircleMeasurementInDrawing(state, action) {
      state.circleMeasurementInDrawing = action.payload
    },

    /**
     * Add a circle measurement to the measurements list from the measurement input form
     */
    setCircleMeasurementToAdd(state, action: PayloadAction<CircleMeasurementToAdd>) {
      state.circleMeasurementToAdd = action.payload
      state.circleMeasurementInDrawing = null
    },

    setMeasurementTypeToAdd(state, action) {
      state.measurementTypeToAdd = action.payload
    }
  }
})

export const {
  addMeasurementDrawed,
  removeMeasurementDrawed,
  resetCircleMeasurementInDrawing,
  resetCircleMeasurementToAdd,
  resetMeasurementTypeToAdd,
  setCircleMeasurementInDrawing,
  setCircleMeasurementToAdd,
  setMeasurementTypeToAdd
} = measurementSlice.actions

export const measurementReducer = measurementSlice.reducer
