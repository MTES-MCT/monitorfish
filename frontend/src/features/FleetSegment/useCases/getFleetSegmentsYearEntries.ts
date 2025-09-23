import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { addBackOfficeBanner } from '@features/BackOffice/useCases/addBackOfficeBanner'
import { fleetSegmentApi } from '@features/FleetSegment/apis'
import { Level } from '@mtes-mct/monitor-ui'

export const getFleetSegmentsYearEntries = () => async dispatch => {
  try {
    return dispatch(
      fleetSegmentApi.endpoints.getFleetSegmentYearEntries.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()
  } catch (error) {
    dispatch(
      addBackOfficeBanner({
        children: (error as Error).message,
        closingDelay: 3000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      })
    )

    return undefined
  }
}
