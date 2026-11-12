import { INFRACTIONS_ERROR_MESSAGE, infractionApi } from '@features/Infraction/apis'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { setInfractions } from '../../shared_slices/Infraction'

import type { MainAppThunk } from '@store'

export const getInfractions = (): MainAppThunk<Promise<void>> => async dispatch => {
  const request = dispatch(infractionApi.endpoints.getInfractions.initiate())

  try {
    const infractions = await request.unwrap()

    dispatch(setInfractions([...infractions].sort((a, b) => a.natinfCode - b.natinfCode)))
  } catch {
    dispatch(
      addSideWindowBanner({
        children: INFRACTIONS_ERROR_MESSAGE,
        closingDelay: 6000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      })
    )
  } finally {
    request.unsubscribe()
  }
}
