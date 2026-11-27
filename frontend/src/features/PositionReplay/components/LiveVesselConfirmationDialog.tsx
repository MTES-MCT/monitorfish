import { liveVesselConfirmationActions } from '@features/PositionReplay/liveVesselConfirmationSlice'
import { selectPositionsDateTime } from '@features/PositionReplay/selectors'
import {
  quitPositionReplayAndShowVessel,
  showVesselAtReplayedDate
} from '@features/PositionReplay/useCases/showVesselFromLiveData'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Dialog } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { getDateTime } from '../../../utils'

export function LiveVesselConfirmationDialog() {
  const dispatch = useMainAppDispatch()
  const vesselIdentity = useMainAppSelector(state => state.liveVesselConfirmation.vesselIdentity)
  const positionsDateTime = useMainAppSelector(selectPositionsDateTime)

  if (!vesselIdentity) {
    return null
  }

  const vesselName = vesselIdentity.vesselName ?? 'ce navire'
  const replayedDate = positionsDateTime ? ` du ${getDateTime(positionsDateTime, true)} (UTC)` : ''

  return (
    <Dialog data-cy="live-vessel-confirmation-dialog">
      <Dialog.Title onClose={() => dispatch(liveVesselConfirmationActions.close())}>
        Mode rejeu des positions
      </Dialog.Title>
      <Body>
        <p>
          Vous rejouez les positions{replayedDate} : le navire {vesselName} sera affiché à cette date, avec sa piste
          dans le passé.
        </p>
      </Body>
      <Dialog.Action>
        <Button accent={Accent.SECONDARY} onClick={() => dispatch(showVesselAtReplayedDate(vesselIdentity))}>
          Rester en mode rejeu
        </Button>
        <Button onClick={() => dispatch(quitPositionReplayAndShowVessel(vesselIdentity))}>
          Quitter le rejeu et afficher le navire en direct
        </Button>
      </Dialog.Action>
    </Dialog>
  )
}

const Body = styled(Dialog.Body)`
  > p {
    color: ${p => p.theme.color.charcoal};
  }
`
