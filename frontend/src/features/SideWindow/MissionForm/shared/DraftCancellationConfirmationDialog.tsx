import { Accent, Button, Dialog } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

import { sideWindowActions } from '../../../../domain/shared_slices/SideWindow'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'

export function DraftCancellationConfirmationDialog() {
  const dispatch = useMainAppDispatch()

  const cancel = useCallback(() => {
    dispatch(sideWindowActions.closeDraftCancellationConfirmationDialog())
  }, [dispatch])

  const confirm = useCallback(() => {
    dispatch(sideWindowActions.confirmDraftCancellationAndGoToNextMenuWithSubMenu())
  }, [dispatch])

  return (
    <Dialog isAbsolute>
      <StyledDialogTitle>Enregistrer les modifications ?</StyledDialogTitle>
      <Dialog.Body>
        <p>Vous êtes en train d’abandonner l’édition d’une mission.</p>
        <p>Voulez-vous enregistrer les modifications avant de quitter ?</p>
      </Dialog.Body>

      <Dialog.Action>
        <Button accent={Accent.TERTIARY} onClick={cancel}>
          Retourner à l’édition
        </Button>
        <Button accent={Accent.SECONDARY} onClick={confirm}>
          Quitter sans enregistrer
        </Button>
      </Dialog.Action>
    </Dialog>
  )
}

// TODO Remove that once we get rid of global legacy CSS.
const StyledDialogTitle = styled(Dialog.Title)`
  line-height: 48px;
`
