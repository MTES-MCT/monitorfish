import { Button, Dialog as MuiDialog, Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'

export type DialogProps = {
  color?: string
  iconName?: keyof typeof Icon
  message: string
  onClose: () => Promisable<void>
  title: string
  titleBackgroundColor?: string
}
export function Dialog({ color, iconName, message, onClose, title, titleBackgroundColor }: DialogProps) {
  const SelectedIcon = iconName ? Icon[iconName] : null

  return (
    <StyledDialog $titleBackgroundColor={titleBackgroundColor}>
      <MuiDialog.Title>{title}</MuiDialog.Title>
      <MuiDialog.Body>
        {SelectedIcon && (
          <Picto>
            <SelectedIcon color={color} size={30} />
          </Picto>
        )}
        <Message $color={color}>{message}</Message>
      </MuiDialog.Body>
      <MuiDialog.Action>
        <Button onClick={onClose}>Fermer</Button>
      </MuiDialog.Action>
    </StyledDialog>
  )
}

// TODO Allow direct `width` prop control in MUI.
// This is a mess. I wonder if we should add inner classes in MUI.
const StyledDialog = styled(MuiDialog)<{
  $titleBackgroundColor: string | undefined
}>`
  > div:last-child {
    max-width: 440px;
    min-width: 440px;

    /* Dialog.Title */
    > h4 {
      ${p => p.$titleBackgroundColor && `background-color: ${p.$titleBackgroundColor};`}
    }

    /* Dialog.Body */
    > div:nth-child(2) {
      padding: 24px 40px 8px;
    }

    /* Dialog.Action */
    > div:last-child {
      padding: 24px 0 32px;

      > .Element-Button {
        width: 136px;

        &:not(:first-child) {
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
