import { createSlice } from '@reduxjs/toolkit'

const gearSlice = createSlice({
  name: 'gear',
  initialState: {
    gears: [],
    categoriesToGears: {}
  },
  reducers: {
    setGears (state, action) {
      state.gears = action.payload
    },
    setCategoriesToGears (state, action) {
      state.categoriesToGears = action.payload
    }
  }
})

export const {
  setGears,
  setCategoriesToGears
} = gearSlice.actions

export default gearSlice.reducer
