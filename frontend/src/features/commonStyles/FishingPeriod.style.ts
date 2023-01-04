import styled from 'styled-components'

export const Row = styled.div<{
  display: boolean
}>`
  display: ${p => (p.display === false ? 'none' : 'flex')};
  margin-bottom: 8px;
  color: ${p => p.theme.color.slateGray};
`

export const TimeRow = styled(Row)<{
  disabled: boolean
}>`
  opacity: ${p => (p.disabled ? '0.4' : '1')};
`

export const DateRanges = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  margin-right: 10px;
`

export const ContentWrapper = styled.div<{
  alignSelf: boolean
}>`
  display: flex;
  flex-direction: row;
  height: 100%;
  ${p => (p.alignSelf ? `align-self: ${p.alignSelf}` : '')};
`
