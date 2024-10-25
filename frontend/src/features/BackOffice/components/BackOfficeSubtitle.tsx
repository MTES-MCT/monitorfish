import styled from 'styled-components'

export const BackOfficeSubtitle = styled.h2<{
  $isFirst?: boolean
  $withSmallBottomMargin?: boolean
}>`
  font-size: 18px;
  line-height: 1;
  margin: ${p => (p.$isFirst ? 0 : 24)}px 0 ${p => (p.$withSmallBottomMargin ? 8 : 24)}px;
`
