import { createSlice } from '@reduxjs/toolkit'

import type { Gear } from '../types/Gear'

export type GearState = {
  categoriesToGears: Map<string, Gear[]> | undefined
  gears: Gear[]
  gearsByCode: Map<string, Gear> | undefined
  groupsToCategories: Map<string, string> | undefined
}
const INITIAL_STATE: GearState = {
  categoriesToGears: undefined,
  gears: [],
  gearsByCode: undefined,
  groupsToCategories: undefined
}

const gearSlice = createSlice({
  initialState: INITIAL_STATE,
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
    }
  }
})

export const { setCategoriesToGears, setGears, setGearsByCode, setGroupsToCategories } = gearSlice.actions

export const gearReducer = gearSlice.reducer
