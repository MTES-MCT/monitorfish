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
