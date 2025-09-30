import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { fleetSegmentApi } from '@features/FleetSegment/apis'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

export const getFleetSegmentsYearEntries = () => async dispatch => {
  try {
    return dispatch(
      fleetSegmentApi.endpoints.getFleetSegmentYearEntries.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()
  } catch (error) {
    dispatch(
      addMainWindowBanner({
        children: (error as Error).message,
        closingDelay: 6000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      })
    )

    return undefined
  }
}
