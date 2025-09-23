import { addBackOfficeBanner } from '@features/BackOffice/useCases/addBackOfficeBanner'
import { fleetSegmentApi } from '@features/FleetSegment/apis'
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
