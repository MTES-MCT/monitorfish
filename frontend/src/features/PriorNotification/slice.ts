import { RichBoolean } from '@mtes-mct/monitor-ui'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { ExpectedArrivalPeriod } from './components/PriorNotificationList/constants'
import { SeaFrontGroup } from '../../domain/entities/seaFront/constants'

import type { ListFilter } from './components/PriorNotificationList/types'

interface PriorNotificationState {
  listFilterValues: ListFilter
}
const INITIAL_STATE: PriorNotificationState = {
  listFilterValues: {
    countryCodes: undefined,
    expectedArrivalCustomPeriod: undefined,
    expectedArrivalPeriod: ExpectedArrivalPeriod.AFTER_FOUR_HOURS_AGO,
    fleetSegmentSegments: undefined,
    gearCodes: undefined,
    hasOneOrMoreReportings: RichBoolean.BOTH,
    isLessThanTwelveMetersVessel: RichBoolean.BOTH,
    isSent: undefined,
    lastControlPeriod: undefined,
    portLocodes: undefined,
    seaFrontGroup: SeaFrontGroup.ALL,
    searchQuery: undefined,
    specyCodes: undefined,
    types: undefined
  }
}

const priorNotificationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'priorNotification',
  reducers: {
    setListFilterValues(state, action: PayloadAction<Partial<ListFilter>>) {
      state.listFilterValues = {
        ...state.listFilterValues,
        ...action.payload
      }
    }
  }
})

export const priorNotificationActions = priorNotificationSlice.actions
export const priorNotificationReducer = priorNotificationSlice.reducer