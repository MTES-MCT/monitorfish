import styled from 'styled-components'

export const Info = styled.p`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
  line-height: 18px;
  margin-bottom: 16px;
`

export const EmptyDataLabel = styled(Info)`
  margin-top: 0;
`
