import { Button, Dialog as MuiDialog } from '@mtes-mct/monitor-ui'

import type { ReactNode } from 'react'
import type { Promisable } from 'type-fest'

export type DialogProps = {
  message: string | ReactNode
  onClose: () => Promisable<void>
  title: string
}
export function Dialog({ message, onClose, title }: DialogProps) {
  return (
    <MuiDialog>
      <MuiDialog.Title onClose={onClose}>{title}</MuiDialog.Title>
      <MuiDialog.Body>{message}</MuiDialog.Body>
      <MuiDialog.Action>
        <Button onClick={onClose}>Fermer</Button>
      </MuiDialog.Action>
    </MuiDialog>
  )
}
