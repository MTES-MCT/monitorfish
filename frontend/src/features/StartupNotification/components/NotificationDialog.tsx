import { Accent, Button, Dialog } from '@mtes-mct/monitor-ui'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import type { StartupNotification } from '../types'

export type NotificationDialogProps = {
  notification: StartupNotification
  onConfirm: () => void
  onDismiss: () => void
}
export function NotificationDialog({ notification, onConfirm, onDismiss }: NotificationDialogProps) {
  return (
    <StyledDialog>
      <Dialog.Title onClose={onDismiss}>{notification.title}</Dialog.Title>
      <StyledBody>
        <ReactMarkdown>{notification.body}</ReactMarkdown>
      </StyledBody>
      <Dialog.Action>
        {notification.link ? (
          <>
            <Button accent={Accent.SECONDARY} onClick={onDismiss}>
              Fermer
            </Button>
            <Button accent={Accent.PRIMARY} onClick={onConfirm}>
              {notification.link.label}
            </Button>
          </>
        ) : (
          <Button accent={Accent.PRIMARY} onClick={onDismiss}>
            J&apos;ai compris
          </Button>
        )}
      </Dialog.Action>
    </StyledDialog>
  )
}

const StyledDialog = styled(Dialog)`
  > div:nth-child(2) {
    width: 800px;
  }
`

const StyledBody = styled(Dialog.Body)`
  > p,
  span {
    color: ${p => p.theme.color.charcoal};
    font-size: 16px !important;
  }
`
