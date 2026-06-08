import { Accent, Button, Dialog } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { ReactNode } from 'react'
import type { Promisable } from 'type-fest'

export type ConfirmationModalProps = {
  cancelButtonLabel?: string
  confirmationButtonLabel: string
  message: string | ReactNode
  onCancel: () => Promisable<void>
  onConfirm: () => Promisable<void>
  title: string
}

export function ConfirmationModal({
  cancelButtonLabel = 'Annuler',
  confirmationButtonLabel,
  message,
  onCancel,
  onConfirm,
  title
}: ConfirmationModalProps) {
  return (
    <Dialog>
      <Dialog.Title onClose={onCancel}>{title}</Dialog.Title>
      <StyledBody>{message}</StyledBody>
      <Dialog.Action>
        <Button accent={Accent.SECONDARY} onClick={onCancel}>
          {cancelButtonLabel}
        </Button>
        <Button accent={Accent.CAUTION} onClick={onConfirm}>
          {confirmationButtonLabel}
        </Button>
      </Dialog.Action>
    </Dialog>
  )
}

const StyledBody = styled(Dialog.Body)`
  > p,
  span {
    color: ${p => p.theme.color.charcoal};
    font-size: 16px !important;
  }
`
