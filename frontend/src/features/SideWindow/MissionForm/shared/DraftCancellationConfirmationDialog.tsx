import { Accent, Button, Dialog } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { sideWindowActions } from '../../../../domain/shared_slices/SideWindow'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'

export function DraftCancellationConfirmationDialog() {
  const dispatch = useMainAppDispatch()

  const cancel = () => {
    dispatch(sideWindowActions.closeDraftCancellationConfirmationDialog())
  }

  const confirm = () => {
    dispatch(sideWindowActions.confirmDraftCancellationAndGoToNextMenuWithSubMenu())
  }

  return (
    <Dialog isAbsolute>
      <StyledDialogTitle>Enregistrer les modifications ?</StyledDialogTitle>
      <Dialog.Body>
        <p>Vous êtes en train d’abandonner l’édition d’une mission.</p>
        <p>Si vous souhaitez enregistrer les modifications, merci de corriger les champs en erreurs.</p>
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
  margin: 0;
`
