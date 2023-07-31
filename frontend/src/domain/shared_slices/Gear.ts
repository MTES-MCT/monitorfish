import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { Gear } from '../types/Gear'

export type GearState = {
  categoriesToGears: Record<string, Gear[]> | undefined
  gears: Gear[]
  gearsByCode: Record<string, Gear> | undefined
  groupsToCategories: Record<string, string> | undefined
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
    setCategoriesToGears(state, action: PayloadAction<Record<string, Gear[]>>) {
      state.categoriesToGears = action.payload
    },

    setGears(state, action: PayloadAction<Gear[]>) {
      state.gears = action.payload
    },

    setGearsByCode(state, action: PayloadAction<Record<string, Gear>>) {
      state.gearsByCode = action.payload
    },

    setGroupsToCategories(state, action: PayloadAction<Record<string, string>>) {
      state.groupsToCategories = action.payload
    }
  }
})

export const { setCategoriesToGears, setGears, setGearsByCode, setGroupsToCategories } = gearSlice.actions

export const gearReducer = gearSlice.reducer
