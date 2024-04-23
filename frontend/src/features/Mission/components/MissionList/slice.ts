import { SeafrontGroup, type AllSeafrontGroup } from '@constants/seafront'
import { Mission } from '@features/Mission/mission.types'
import { createSlice } from '@reduxjs/toolkit'

import { MissionDateRangeFilter, MissionFilterType } from './types'

import type { FilterValues } from './types'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface MissionListState {
  listFilterValues: FilterValues
  listSeafrontGroup: SeafrontGroup | AllSeafrontGroup
}
const INITIAL_STATE: MissionListState = {
  listFilterValues: {
    [MissionFilterType.DATE_RANGE]: MissionDateRangeFilter.WEEK,
    [MissionFilterType.STATUS]: [Mission.MissionStatus.IN_PROGRESS]
  },
  listSeafrontGroup: SeafrontGroup.MED
}

const missionListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'mission',
  reducers: {
    /**
     * Set filter values in missions list
     */
    setListFilterValues(state, action: PayloadAction<FilterValues>) {
      state.listFilterValues = action.payload
    },

    /**
     * Set sea front filter in missions list
     */
    setListSeafront(state, action: PayloadAction<SeafrontGroup | AllSeafrontGroup>) {
      state.listSeafrontGroup = action.payload
    }
  }
})

export const missionListActions = missionListSlice.actions
export const missionListReducer = missionListSlice.reducer
