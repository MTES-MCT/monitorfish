import { createSlice } from '@reduxjs/toolkit'

const backofficeMapSlice = createSlice({
  name: 'backofficeMap',
  initialState: {
    isMoving: false
  },
  reducers: {
    isMoving (state) {
      state.isMoving = !state.isMoving
    }
  }
})

export const {
  isMoving
} = backofficeMapSlice.actions

export default backofficeMapSlice.reducer
