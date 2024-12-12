import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface BackofficeProducerOrganizationMembershipState {
  searchQuery: string | undefined
}
const INITIAL_STATE: BackofficeProducerOrganizationMembershipState = {
  searchQuery: ''
}

const backofficeProducerOrganizationMembershipSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'producerOrganizationMembership',
  reducers: {
    setSearchQuery(state, action: PayloadAction<string | undefined>) {
      state.searchQuery = action.payload
    }
  }
})

export const backofficeProducerOrganizationMembershipActions = backofficeProducerOrganizationMembershipSlice.actions
export const backofficeProducerOrganizationMembershipReducer = backofficeProducerOrganizationMembershipSlice.reducer
