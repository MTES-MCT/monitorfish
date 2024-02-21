import { Accent, Button, Dialog } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'

type DeletionConfirmationDialogProps = Readonly<{
  onCancel: () => Promisable<void>
  onConfirm: () => Promisable<void>
}>
export function DeletionConfirmationDialog({ onCancel, onConfirm }: DeletionConfirmationDialogProps) {
  return (
    <Dialog isAbsolute>
      <StyledDialogTitle>Confirmation de suppression</StyledDialogTitle>
      <Dialog.Body>
        <p>Êtes-vous sûr de vouloir supprimer cette mission ?</p>
      </Dialog.Body>

      <Dialog.Action>
        <Button accent={Accent.TERTIARY} onClick={onCancel}>
          Retourner à l’édition
        </Button>
        <Button accent={Accent.SECONDARY} onClick={onConfirm}>
          Confirmer la suppression
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
