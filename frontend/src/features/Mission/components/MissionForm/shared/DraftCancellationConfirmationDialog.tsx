import { Bold } from '@components/style'
import { cancelSideWindowDraftCancellation } from '@features/SideWindow/useCases/cancelSideWindowDraftCancellation'
import { confirmSideWindowDraftCancellationAndProceed } from '@features/SideWindow/useCases/confirmSideWindowDraftCancellationAndProceed'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, Dialog } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type DraftCancellationConfirmationDialogProps = Readonly<{
  isAutoSaveEnabled: boolean
  isNew: boolean
}>
export function DraftCancellationConfirmationDialog({
  isAutoSaveEnabled,
  isNew
}: DraftCancellationConfirmationDialogProps) {
  const dispatch = useMainAppDispatch()

  const cancel = () => {
    dispatch(cancelSideWindowDraftCancellation())
  }

  const confirm = () => {
    dispatch(confirmSideWindowDraftCancellationAndProceed())
  }

  return (
    <StyledDialog isAbsolute>
      <Dialog.Title onClose={cancel}>Quitter sans enregistrer</Dialog.Title>
      <Dialog.Body>
        <p>
          Vous êtes en train d’abandonner
          <StyledBold>{isNew ? ' la création de la mission' : ' l’édition de la mission'}</StyledBold>
        </p>
        {!isAutoSaveEnabled && (
          <span>
            et <RedText>l’enregistrement automatique n’est pas actif.</RedText>
          </span>
        )}
        {isAutoSaveEnabled ? (
          <>
            <p>Si vous souhaitez que les modifications s’enregistrent,</p>
            <span>merci de corriger les champs en erreur.</span>
          </>
        ) : (
          <p>Veuillez enregistrer les modifications avant de quitter.</p>
        )}
      </Dialog.Body>

      <Dialog.Action>
        <Button accent={Accent.SECONDARY} onClick={cancel}>
          Annuler
        </Button>
        <Button accent={Accent.CAUTION} onClick={confirm}>
          Quitter sans enregistrer
        </Button>
      </Dialog.Action>
    </StyledDialog>
  )
}

const StyledDialog = styled(Dialog)`
  > div:nth-child(2) {
    width: 580px;
  }
`
const StyledBold = styled(Bold)`
  font-size: 16px;
`

const RedText = styled(StyledBold)`
  color: ${({ theme }) => theme.color.maximumRed};
`
