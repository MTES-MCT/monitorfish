import styled from 'styled-components'

export const Bold = styled.span`
  font-weight: 700;
`

export const TransparentButton = styled.button.attrs(() => ({
  type: 'button'
}))`
  background: transparent;
  border: none;
  text-align: start;

  &:hover {
    background: transparent;
    border: none;
  }

  width: 100%;
  height: 100%;
  padding: 0;
`

export const StyledTransparentButton = styled(TransparentButton)`
  display: flex;
  padding: 6px 0 6px 16px;
`
