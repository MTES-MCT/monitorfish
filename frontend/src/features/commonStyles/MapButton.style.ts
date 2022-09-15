import styled from 'styled-components'

export const MapButtonStyle = styled.button<{
  // TODO Replace this prop by an explicit boolean
  healthcheckTextWarning?: string
  isHidden: boolean
}>`
  margin-top: ${p => (p.healthcheckTextWarning ? 50 : 0)}px;
  visibility: ${p => (p.isHidden ? 'hidden' : 'visible')};
`
