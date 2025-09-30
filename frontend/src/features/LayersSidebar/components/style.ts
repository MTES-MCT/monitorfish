import styled from 'styled-components'

export const Title = styled.div<{
  $isOpen: boolean
}>`
  background: ${p => p.theme.color.charcoal};
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-bottom-left-radius: ${p => (p.$isOpen ? '0' : '2px')};
  border-bottom-right-radius: ${p => (p.$isOpen ? '0' : '2px')};
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  color: ${p => p.theme.color.gainsboro};
  font-size: 16px;
  display: flex;
  align-items: center;
  padding-right: 8px;
`
