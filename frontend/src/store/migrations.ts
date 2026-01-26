export const MAIN_PERSISTOR_MISSION_MIGRATIONS = {
  0: state => ({
    ...state,
    listSeafrontGroup: state.listSeafrontGroup === 'ALL_SEAFRONT_GROUP' ? 'ALL' : state.listSeafrontGroup
  })
}

export const MAIN_PERSISTOR_VESSEL_GROUPS_MIGRATIONS = {
  0: state => ({
    ...state,
    vesselGroupsIdsDisplayed: []
  })
}

export const MAIN_PERSISTOR_VESSEL_GROUP_LIST_MIGRATIONS = {
  0: state => ({
    ...state,
    // Convert arrays to single values
    // If array has 0 or 2 elements (all options), set to undefined (show all)
    // If array has 1 element, use that value as the filter
    filteredGroupType: state.filteredGroupTypes?.length === 1 ? state.filteredGroupTypes[0] : undefined,
    filteredSharing: state.filteredSharing?.length === 1 ? state.filteredSharing[0] : undefined
  })
}

export const MAIN_PERSISTOR_VESSEL_MIGRATIONS = {
  0: state => {
    const nextState = { ...state }

    delete nextState.listFilterValues.lastLandingPortLocodes

    return nextState
  },
  1: state => {
    const nextState = {
      ...state
    }

    nextState.listFilterValues.lastControlAtQuayPeriod = state.listFilterValues.lastControlPeriod
    nextState.listFilterValues.lastControlAtSeaPeriod = state.listFilterValues.lastControlPeriod

    delete nextState.listFilterValues.lastControlPeriod

    return nextState
  }
}
