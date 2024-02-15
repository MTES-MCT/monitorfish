import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { ReceivedAtPeriod } from './components/PriorNotificationList/constants'
import { SeaFrontGroup } from '../../domain/entities/seaFront/constants'

import type { ListFilterValues } from './components/PriorNotificationList/types'

interface PriorNotificationState {
  listFilterValues: ListFilterValues
}
const INITIAL_STATE: PriorNotificationState = {
  listFilterValues: {
    countryCodes: undefined,
    fleetSegments: undefined,
    gearCodes: undefined,
    hasOneOrMoreReportings: undefined,
    isLessThanTwelveMetersVessel: undefined,
    isSent: undefined,
    isVesselPretargeted: undefined,
    lastControlPeriod: undefined,
    portLocodes: undefined,
    query: undefined,
    receivedAtCustomDateRange: undefined,
    receivedAtPeriod: ReceivedAtPeriod.AFTER_FOUR_HOURS_AGO,
    seaFrontGroup: SeaFrontGroup.ALL,
    specyCodes: undefined,
    types: undefined
  }
}

const priorNotificationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'priorNotification',
  reducers: {
    setListFilterValues(state, action: PayloadAction<Partial<ListFilterValues>>) {
      state.listFilterValues = {
        ...state.listFilterValues,
        ...action.payload
      }
    }
  }
})

export const priorNotificationActions = priorNotificationSlice.actions
export const priorNotificationReducer = priorNotificationSlice.reducer
