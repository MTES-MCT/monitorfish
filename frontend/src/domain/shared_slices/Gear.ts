import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { Gear } from '../types/Gear'
import type { REGULATED_GEARS_KEYS } from 'domain/entities/backoffice'

export type GearState = {
  categoriesToGears: Record<string, Gear[]> | undefined
  gears: Gear[]
  gearsByCode: Record<string, Gear> | undefined
  groupsToCategories: Partial<Record<REGULATED_GEARS_KEYS, string[]>> | undefined
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

    setGroupsToCategories(state, action: PayloadAction<Partial<Record<REGULATED_GEARS_KEYS, string[]>>>) {
      state.groupsToCategories = action.payload
    }
  }
})

export const { setCategoriesToGears, setGears, setGearsByCode, setGroupsToCategories } = gearSlice.actions

export const gearActions = gearSlice.actions
export const gearReducer = gearSlice.reducer
