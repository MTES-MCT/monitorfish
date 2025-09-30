import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { getInfractionsFromAPI } from '../../../api/infraction'
import { setInfractions } from '../../shared_slices/Infraction'

export const getInfractions = () => dispatch => {
  getInfractionsFromAPI()
    .then(infractions => {
      dispatch(setInfractions(infractions.sort((a, b) => a.natinfCode - b.natinfCode)))
    })
    .catch(error => {
      dispatch(
        addSideWindowBanner({
          children: (error as Error).message,
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    })
}
