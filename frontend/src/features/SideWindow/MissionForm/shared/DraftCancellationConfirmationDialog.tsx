import { Accent, Button, Dialog } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'

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
      <Dialog.Title>Enregistrer les modifications ?</Dialog.Title>
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
