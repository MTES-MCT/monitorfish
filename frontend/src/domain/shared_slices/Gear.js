import { createSlice } from '@reduxjs/toolkit'

const gearSlice = createSlice({
  name: 'gear',
  initialState: {
    gears: [],
    categoriesToGears: undefined,
    groupsToCategories: undefined,
    gearsByCode: undefined
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
    },
    setGearsByCode (state, action) {
      state.gearsByCode = action.payload
    }
  }
})

export const {
  setGears,
  setCategoriesToGears,
  setGroupsToCategories,
  setGearsByCode
} = gearSlice.actions

export default gearSlice.reducer
