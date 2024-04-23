import { createSlice } from '@reduxjs/toolkit'
import { getLocalStorageState } from '@utils/getLocalStorageState'

import type { MeasurementType } from '../entities/map/constants'

const measurementsLocalStorageKey = 'measurements'

export type MeasurementState = {
  // TODO Type this prop.
  circleMeasurementInDrawing: {
    coordinates: number[]
    measurement: any
  } | null
  // TODO Type this prop.
  circleMeasurementToAdd: null
  measurementTypeToAdd: MeasurementType | null
  // TODO Type this prop.
  measurementsDrawed: Record<string, any>[]
}
const INITIAL_STATE: MeasurementState = {
  circleMeasurementInDrawing: null,
  circleMeasurementToAdd: null,
  measurementsDrawed: getLocalStorageState([], measurementsLocalStorageKey),
  measurementTypeToAdd: null
}

const measurementSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'measurement',
  reducers: {
    addMeasurementDrawed(state, action) {
      const nextMeasurementsDrawed = state.measurementsDrawed.concat(action.payload)

      window.localStorage.setItem(measurementsLocalStorageKey, JSON.stringify(nextMeasurementsDrawed))
      state.measurementsDrawed = nextMeasurementsDrawed
    },
    removeMeasurementDrawed(state, action) {
      const nextMeasurementsDrawed = state.measurementsDrawed.filter(
        measurement => measurement.feature.id !== action.payload
      )

      window.localStorage.setItem(measurementsLocalStorageKey, JSON.stringify(nextMeasurementsDrawed))
      state.measurementsDrawed = nextMeasurementsDrawed
    },
    resetCircleMeasurementInDrawing(state) {
      state.circleMeasurementInDrawing = null
    },
    resetCircleMeasurementToAdd(state) {
      state.circleMeasurementToAdd = null
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
     * @param {Object=} state
     * @param {{
     *  payload: {
          circleCoordinatesToAdd: string
          circleRadiusToAdd: string
        }
     * }} action - The coordinates and radius of the measurement
     */
    setCircleMeasurementToAdd(state, action) {
      state.circleMeasurementToAdd = action.payload
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
