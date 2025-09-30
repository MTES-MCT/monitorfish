import { fleetSegmentApi } from '@features/FleetSegment/apis'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { getFleetSegmentsYearEntries } from './getFleetSegmentsYearEntries'

/**
 * Add a new fleet segment year
 */
export const addFleetSegmentYear = (year: number) => async dispatch => {
  try {
    await dispatch(fleetSegmentApi.endpoints.addFleetSegmentYear.initiate(year)).unwrap()

    return dispatch(getFleetSegmentsYearEntries())
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
