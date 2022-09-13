import { createSlice } from '@reduxjs/toolkit'

const gearSlice = createSlice({
  name: 'gear',
  initialState: {
    /** @type {Gear[]} */
    gears: [],
    /** @type {Map<String, Gear[]>} */
    categoriesToGears: undefined,
    /** @type {Map<String, String>} */
    groupsToCategories: undefined,
    /** @type {Map<String, Gear>} */
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
