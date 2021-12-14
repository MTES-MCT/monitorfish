import { createSlice } from '@reduxjs/toolkit'

const gearSlice = createSlice({
  name: 'gear',
  initialState: {
    gears: [],
    categoriesToGears: {},
    groupsToCategories: {}
  },
  reducers: {
    setGears (state, action) {
      state.gears = action.payload
    },
    setCategoriesToGears (state, action) {
      state.categoriesToGears = action.payload
    },
    setGroupsToCategories (state, action) {
      state.groupsToCategories = action.payload
    }
  }
})

export const {
  setGears,
  setCategoriesToGears,
  setGroupsToCategories
} = gearSlice.actions

export default gearSlice.reducer
