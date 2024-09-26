import { IconButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

// TODO Replace this dirty hack with an `IconButton` prop in some monitor-ui fields.
const BareFieldWithIconButton = styled.div<{
  $hasError: boolean
}>`
  align-items: flex-end;
  display: flex;

  > *:first-child {
    flex-grow: 1;
    margin-right: 4px;
  }

  .Element-IconButton {
    margin-bottom: ${p => (p.$hasError ? '22px' : 0)};
  }
`

const IconButtonOff = styled(IconButton)`
  background-color: ${p => p.theme.color.white};
  border-color: ${p => p.theme.color.white};
  color: ${p => p.theme.color.charcoal};
  padding: 4px;
  &:hover {
    background-color: ${p => p.theme.color.white};
    border-color: ${p => p.theme.color.white};
    color: ${p => p.theme.color.blueYonder};
  }
`

const IconButtonOn = styled(IconButtonOff)`
  background-color: ${p => p.theme.color.charcoal};
  border-color: ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.white};
`

export const FieldWithButton = Object.assign(BareFieldWithIconButton, {
  IconButtonOff,
  IconButtonOn
})
