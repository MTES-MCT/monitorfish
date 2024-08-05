import { Accent, Button, Dialog } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'

type InvalidatePriorNotificationDialogProps = Readonly<{
  onCancel: () => Promisable<void>
  onConfirm: () => Promisable<void>
}>
export function InvalidatePriorNotificationDialog({ onCancel, onConfirm }: InvalidatePriorNotificationDialogProps) {
  return (
    <Dialog isAbsolute>
      <StyledDialogTitle>Invalider le préavis</StyledDialogTitle>
      <Dialog.Body>
        <p>
          <b>Êtes-vous sûr de vouloir invalider ce préavis ?</b>
        </p>
        <p>Vous ne pourrez plus le modifier ni le diffuser aux unités. Vous pourrez toujours le consulter.</p>
      </Dialog.Body>

      <Dialog.Action>
        <Button accent={Accent.PRIMARY} onClick={onConfirm}>
          Confirmer l’invalidation
        </Button>
        <Button accent={Accent.SECONDARY} onClick={onCancel}>
          Annuler
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
