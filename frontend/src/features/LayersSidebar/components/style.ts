import { TransparentButton } from '@components/style'
import styled from 'styled-components'

export const Title = styled.div<{
  $isOpen: boolean
}>`
  background: ${p => p.theme.color.charcoal};
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 2px 2px ${p => (p.$isOpen ? '0 0' : '2px 2px')};
  color: ${p => p.theme.color.gainsboro};
  font-size: 16px;
  display: flex;
  align-items: center;
  padding-right: 8px;
`

export const StyledTransparentButton = styled(TransparentButton)`
  display: flex;
  padding: 6px 0 6px 16px;
`
