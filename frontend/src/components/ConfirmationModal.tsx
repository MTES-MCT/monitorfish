import { Accent, Button, Dialog, Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'

export type ConfirmationModalProps = {
  color?: string
  confirmationButtonLabel: string
  iconName?: keyof typeof Icon
  message: string
  onCancel: () => Promisable<void>
  onConfirm: () => Promisable<void>
  title: string
}
export function ConfirmationModal({
  color,
  confirmationButtonLabel,
  iconName,
  message,
  onCancel,
  onConfirm,
  title
}: ConfirmationModalProps) {
  const SelectedIcon = iconName ? Icon[iconName] : null

  return (
    <StyledDialog>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Body>
        {SelectedIcon && (
          <Picto>
            <SelectedIcon color={color} size={30} />
          </Picto>
        )}
        <Message $color={color}>{message}</Message>
      </Dialog.Body>
      <Dialog.Action>
        <Button onClick={onConfirm}>{confirmationButtonLabel}</Button>
        <Button accent={Accent.SECONDARY} onClick={onCancel}>
          Annuler
        </Button>
      </Dialog.Action>
    </StyledDialog>
  )
}

// TODO Allow direct `width` prop control in MUI.
// This is a mess. I wonder if we should add inner classes in MUI.
const StyledDialog = styled(Dialog)`
  > div:last-child {
    max-width: 440px;
    min-width: 440px;

    /* Dialog.Body */
    > div:nth-child(2) {
      padding: 24px 40px 8px;
    }

    /* Dialog.Action */
    > div:last-child {
      padding: 24px 0 32px;

      > .Element-Button {
        width: 175px;

        :not(:first-child) {
          margin-left: 8px;
        }
      }
    }
  }
`

const Picto = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
`

/* TODO Replace the `> p` forcing the `!important`. */
const Message = styled.p<{
  $color: string | undefined
}>`
  ${p => p.$color && `color: ${p.$color} !important;`}
  font-size: 16px;
  font-weight: bold;
`
