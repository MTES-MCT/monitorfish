import styled from 'styled-components'

export const Bold = styled.span`
  font-weight: 700;
`

export const TransparentButton = styled.button.attrs(() => ({
  type: 'button'
}))`
  background: transparent;
  border: 1px solid transparent;

  &:hover {
    background: transparent;
    border: 1px solid transparent;
  }

  width: 100%;
  height: 100%;
  padding: 0;
`
