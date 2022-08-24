import { createSlice } from '@reduxjs/toolkit'

const gearSlice = createSlice({
  initialState: {
    /** @type {Map<String, Gear[]>} */
    categoriesToGears: undefined,

    /** @type {Gear[]} */
    gears: [],

    /** @type {Map<String, Gear>} */
    gearsByCode: undefined,

    /** @type {Map<String, String>} */
    groupsToCategories: undefined,
  },
  name: 'gear',
  reducers: {
    setCategoriesToGears(state, action) {
      state.categoriesToGears = action.payload
    },
    setGears(state, action) {
      state.gears = action.payload
    },
    setGearsByCode(state, action) {
      state.gearsByCode = action.payload
    },
    setGroupsToCategories(state, action) {
      state.groupsToCategories = action.payload
    },
  },
})

export const { setCategoriesToGears, setGears, setGearsByCode, setGroupsToCategories } = gearSlice.actions

export default gearSlice.reducer
