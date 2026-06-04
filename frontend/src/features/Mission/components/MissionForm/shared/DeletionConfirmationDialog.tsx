import { Bold } from '@components/style'
import { Accent, Button, Dialog } from '@mtes-mct/monitor-ui'

import type { Promisable } from 'type-fest'

type DeletionConfirmationDialogProps = Readonly<{
  onCancel: () => Promisable<void>
  onConfirm: () => Promisable<void>
}>
export function DeletionConfirmationDialog({ onCancel, onConfirm }: DeletionConfirmationDialogProps) {
  return (
    <Dialog isAbsolute>
      <Dialog.Title onClose={onCancel}>Supprimer la mission</Dialog.Title>
      <Dialog.Body>
        <p>Êtes-vous sûr de vouloir</p>
        <Bold>supprimer cette mission ?</Bold>
      </Dialog.Body>

      <Dialog.Action>
        <Button accent={Accent.SECONDARY} onClick={onCancel}>
          Annuler
        </Button>
        <Button accent={Accent.CAUTION} onClick={onConfirm}>
          Confirmer la suppression
        </Button>
      </Dialog.Action>
    </Dialog>
  )
}
