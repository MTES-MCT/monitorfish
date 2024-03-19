import { cancelSideWindowDraftCancellation } from '@features/SideWindow/useCases/cancelSideWindowDraftCancellation'
import { confirmSideWindowDraftCancellationAndProceed } from '@features/SideWindow/useCases/confirmSideWindowDraftCancellationAndProceed'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, Dialog } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type DraftCancellationConfirmationDialogProps = Readonly<{
  isAutoSaveEnabled: boolean
}>
export function DraftCancellationConfirmationDialog({ isAutoSaveEnabled }: DraftCancellationConfirmationDialogProps) {
  const dispatch = useMainAppDispatch()

  const cancel = () => {
    dispatch(cancelSideWindowDraftCancellation())
  }

  const confirm = () => {
    dispatch(confirmSideWindowDraftCancellationAndProceed())
  }

  return (
    <Dialog isAbsolute>
      <StyledDialogTitle>Enregistrement impossible</StyledDialogTitle>
      <Dialog.Body>
        <p>Vous êtes en train d’abandonner l’édition de la mission.</p>
        {isAutoSaveEnabled ? (
          <Details>Si vous souhaitez enregistrer les modifications, merci de corriger les champs en erreur.</Details>
        ) : (
          <Details>Voulez-vous enregistrer les modifications avant de quitter ?</Details>
        )}
      </Dialog.Body>

      <Dialog.Action>
        <Button accent={Accent.SECONDARY} onClick={cancel}>
          Retourner à l’édition
        </Button>
        <Button accent={Accent.TERTIARY} onClick={confirm}>
          Quitter sans enregistrer
        </Button>
      </Dialog.Action>
    </Dialog>
  )
}

const Details = styled.p`
  font-weight: 700;
`

// TODO Remove that once we get rid of global legacy CSS.
const StyledDialogTitle = styled(Dialog.Title)`
  line-height: 48px;
  margin: 0;
`
